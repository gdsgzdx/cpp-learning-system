"use client";

import { useEffect, useRef, useState } from "react";
import { Type, Highlighter, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 富文本笔记编辑器（用于"核心原理"等长文本字段）
 *
 * 功能：
 * - 4 种字体：无衬线 / 衬线 / 等宽 / 手写体
 * - 4 档字号：14 / 16 / 18 / 20px
 * - 4 色高亮：选中文字 → 点击色块 → 文字背景涂色（同时支持字体颜色）
 * - 清除格式：移除选中区域的 inline 样式
 *
 * 存储：内容以 HTML 字符串形式保存在 value 中。
 * - 提交给后端时直接 POST HTML
 * - 渲染时直接用 dangerouslySetInnerHTML
 *
 * 用法：
 *   <RichNoteEditor value={html} onChange={(html) => setHtml(html)} />
 */
export interface RichNoteEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  /** 当内容变化时是否触发 onChange（避免初始化时误触发） */
  skipFirst?: boolean;
}

const FONT_OPTIONS = [
  { value: "sans", label: "无衬线", css: "ui-sans-serif, system-ui, sans-serif" },
  { value: "serif", label: "衬线", css: "ui-serif, Georgia, 'Times New Roman', serif" },
  { value: "mono", label: "等宽", css: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  // 指定具体手写字体名（含中英文），若系统无则回退到 cursive（浏览器默认）
  { value: "cursive", label: "手写", css: "'Comic Sans MS', 'STKaiti', 'KaiTi', '楷体', 'Brush Script MT', cursive" },
];

const SIZE_OPTIONS = [
  { value: "14", label: "小" },
  { value: "16", label: "中" },
  { value: "18", label: "大" },
  { value: "20", label: "特大" },
];

const HIGHLIGHT_COLORS = [
  { name: "黄", bg: "#fef08a", fg: "#713f12" },
  { name: "绿", bg: "#bbf7d0", fg: "#14532d" },
  { name: "粉", bg: "#fbcfe8", fg: "#831843" },
  { name: "蓝", bg: "#bfdbfe", fg: "#1e3a8a" },
];

export function RichNoteEditor({
  value,
  onChange,
  placeholder = "写下你的笔记…（可选中文 / 代码 / 公式）",
  minHeight = 120,
  className,
  skipFirst = true,
}: RichNoteEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const initOnce = useRef(false);

  // 同步外部 value → DOM
  useEffect(() => {
    if (!ref.current) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    // 防止死循环：只在外部值与 DOM 不一致时更新
    const current = ref.current.innerHTML;
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
    if (normalize(current) !== normalize(value)) {
      ref.current.innerHTML = value || "";
      initOnce.current = true;
    }
  }, [value]);

  // 初次挂载时塞入 value
  useEffect(() => {
    if (!ref.current || initOnce.current) return;
    ref.current.innerHTML = value || "";
    initOnce.current = true;
  }, [value]);

  const emitChange = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    isInternalUpdate.current = true;
    onChange(html);
  };

  // ====== 通用工具 ======

  /**
   * 把当前选区内容切出来成 Fragment，并返回 { frag, range } 供调用方处理后插回。
   * 注意：调用方必须在调用前确保选区非空且在编辑器内。
   */
  const extractSelection = (): { frag: DocumentFragment; range: Range; sel: Selection } | null => {
    if (!ref.current) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return null;
    try {
      const frag = range.extractContents();
      return { frag, range, sel };
    } catch (e) {
      console.warn("extractSelection failed", e);
      return null;
    }
  };

  /**
   * 检测"原 DOM 中的选区"是否**完全被一个或多个目标 (bg, fg) 样式的 span 覆盖**。
   * 注意：必须在 extractContents() 之前调用；调用后选区已经被切走了。
   *
   * 返回值：
   *   true  -> 整个选区都在同色高亮 span 内 → toggle 应该"取消"
   *   false -> 选区全部或部分不在同色高亮 span 内 → toggle 应该"应用"
   */
  const isSelectionFullyHighlighted = (bg: string, fg: string): boolean => {
    if (!ref.current) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return false;

    const targetBg = bg.toLowerCase();
    const targetFg = fg.toLowerCase();

    // 遍历选区内的所有文本节点；任何一个文本节点的祖先链上没有匹配的同色高亮 span → false
    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
    let anyText = false;
    let n: Node | null = walker.nextNode();
    while (n) {
      // 只看在选区内的文本节点
      const textNode = n as Text;
      if (!range.intersectsNode(textNode)) {
        n = walker.nextNode();
        continue;
      }
      anyText = true;
      // 检查祖先链
      let matched = false;
      let p: Node | null = textNode.parentNode;
      while (p && p !== ref.current) {
        if (p.nodeType === 1) {
          const el = p as HTMLElement;
          if (el.tagName === "SPAN") {
            const spBg = (el.style.getPropertyValue("background-color") || "").toLowerCase().trim();
            const spFg = (el.style.getPropertyValue("color") || "").toLowerCase().trim();
            if (spBg === targetBg && spFg === targetFg && spBg !== "") {
              matched = true;
              break;
            }
          }
        }
        p = p.parentNode;
      }
      if (!matched) return false;
      n = walker.nextNode();
    }
    return anyText;
  };

  /** 把 fragment 内容插回 range 原位（range 此时是空占位），并把选区重新指向该 fragment 根 */
  const restoreSelection = (frag: DocumentFragment, range: Range, sel: Selection) => {
    range.insertNode(frag);
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(range.commonAncestorContainer as Node);
    sel.addRange(newRange);
  };

  /** 在当前光标处插入一个带样式的"占位 span"（0 宽），并把光标放进去。
   *  之后用户的输入会自然继承这个 span 的样式。
   */
  const insertStyleAtCursor = (setStyle: (el: HTMLElement) => void) => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      // 没有光标 → 不动
      return;
    }
    const range = sel.getRangeAt(0);
    // 必须在编辑器内
    if (!ref.current.contains(range.commonAncestorContainer) &&
        !ref.current.contains(range.startContainer)) {
      return;
    }
    const span = document.createElement("span");
    setStyle(span);
    // 用零宽不间断空格做占位，让光标真正落进 span 内
    span.appendChild(document.createTextNode("\u200B"));
    range.deleteContents();
    range.insertNode(span);
    // 把光标移到 span 内的占位字符后面
    const newRange = document.createRange();
    newRange.setStart(span.firstChild!, 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  };

  /**
   * 把当前光标位置所属的"占位 zero-width span"自动去掉，并把光标挪到它的外面。
   * 触发时机：用户输入字符后——避免每次都留一个零宽字符。
   */
  const cleanupZeroWidthAfterInput = () => {
    if (!ref.current) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.startContainer)) return;

    // 找祖先链：第一个零宽字符文本节点所在 span，如果它**只有这一个字符**且前面/后面没别的内容，就拆掉
    let node: Node | null = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE && (node as Text).data === "\u200B") {
      const span = node.parentNode as HTMLElement | null;
      if (span && span.tagName === "SPAN" && span.childNodes.length === 1) {
        // 把光标挪到 span 外面（后面）
        const parent = span.parentNode!;
        const after = span.nextSibling;
        const r = document.createRange();
        if (after) {
          r.setBefore(after);
        } else {
          r.selectNodeContents(parent);
          r.collapse(false);
        }
        sel.removeAllRanges();
        sel.addRange(r);
        parent.removeChild(span);
      }
    }
  };

  /**
   * 把整个 fragment 包进一个带样式的 span。
   * 注意：本函数只做"套一层 span"，取消样式由调用方通过 stripMatchingStyle 完成。
   */
  const wrapFragment = (frag: DocumentFragment, setStyle: (el: HTMLElement) => void) => {
    const span = document.createElement("span");
    setStyle(span);
    // 把 frag 所有子节点移到 span 里
    while (frag.firstChild) {
      span.appendChild(frag.firstChild);
    }
    frag.appendChild(span);
  };

  // ====== 直接 DOM 操作的 toggle（不依赖 fragment extract） ======

  /**
   * 把 range 拆分成"全部位于 range 内"的文本节点片，并按以下规则处理：
   * - remove=true：所有匹配 styleKey==targetValue 的 span → 剥掉该 style；如果剥完后 span
   *   没有其他属性且没数据 → unwrap
   * - remove=false：对 range 内所有文本片段套一层带 styleKey=targetValue 的 span
   */
  const toggleStyleOnRange = (range: Range, styleKey: string, targetValue: string, remove: boolean) => {
    if (!ref.current) return;

    // 收集 range 内所有文本节点（部分可能跨 span 边界）
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT);
    let n: Node | null = walker.nextNode();
    while (n) {
      const t = n as Text;
      if (range.intersectsNode(t) && t.data.length > 0) {
        textNodes.push(t);
      }
      n = walker.nextNode();
    }
    if (textNodes.length === 0) return;

    if (remove) {
      // 对每个文本节点：把所有匹配的祖先 span 上的该 style 属性剥掉
      for (const t of textNodes) {
        let p: Node | null = t.parentNode;
        while (p && p !== ref.current) {
          if (p.nodeType === 1 && (p as HTMLElement).tagName === "SPAN") {
            const el = p as HTMLElement;
            if ((el.style.getPropertyValue(styleKey) || "").toLowerCase().trim() === targetValue.toLowerCase().trim()) {
              el.style.removeProperty(styleKey);
              // 如果该 span 没有其他 inline style 且没有其他属性，unwrap
              if (el.style.length === 0 && el.attributes.length <= 1) {
                const parent = el.parentNode!;
                while (el.firstChild) parent.insertBefore(el.firstChild, el);
                parent.removeChild(el);
              }
            }
          }
          p = p.parentNode;
        }
      }
    } else {
      // 应用：对每个文本节点，看其直接祖先 span 是否已是目标样式
      // 如果不是 → 套一个；如果 span 内还有别的兄弟 → 先把文本节点 split 出来
      for (const t of textNodes) {
        // 检查直接父 span 是否已经是 targetValue
        let direct = t.parentNode;
        if (direct && (direct as HTMLElement).tagName === "SPAN" &&
            (direct as HTMLElement).style.getPropertyValue(styleKey).toLowerCase().trim() === targetValue.toLowerCase().trim()) {
          // 已是该字体 → 跳过
          continue;
        }
        // 拆出独立文本节点：插入一个占位 span 包这个文本节点
        const span = document.createElement("span");
        span.style.setProperty(styleKey, targetValue);
        const parent = t.parentNode!;
        // 把 t 之前的兄弟留下；t 移到 span 里；span 插到 t 原来位置
        parent.insertBefore(span, t);
        span.appendChild(t);
        // 合并相邻同样式 span（减少嵌套）
        mergeAdjacentSpans(parent as HTMLElement, styleKey, targetValue);
      }
    }
  };

  /**
   * 高亮 toggle：
   * - remove=true：剥掉选区内所有 (bg, fg) 匹配的 span 的样式并 unwrap
   * - remove=false：对选区文本套高亮 span（先 split 文本避免污染兄弟节点）
   */
  const toggleHighlightOnRange = (range: Range, bg: string, fg: string, remove: boolean) => {
    if (!ref.current) return;
    const targetBg = normalizeColor(bg);
    const targetFg = normalizeColor(fg);

    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT);
    let n: Node | null = walker.nextNode();
    while (n) {
      const t = n as Text;
      if (range.intersectsNode(t) && t.data.length > 0) textNodes.push(t);
      n = walker.nextNode();
    }
    if (textNodes.length === 0) return;

    if (remove) {
      for (const t of textNodes) {
        let p: Node | null = t.parentNode;
        while (p && p !== ref.current) {
          if (p.nodeType === 1 && (p as HTMLElement).tagName === "SPAN") {
            const el = p as HTMLElement;
            const spBg = normalizeColor(el.style.getPropertyValue("background-color"));
            const spFg = normalizeColor(el.style.getPropertyValue("color"));
            if (spBg === targetBg && spFg === targetFg && spBg !== "") {
              el.style.removeProperty("background-color");
              el.style.removeProperty("color");
              el.style.removeProperty("padding");
              el.style.removeProperty("border-radius");
              if (el.style.length === 0 && el.attributes.length <= 1) {
                const parent = el.parentNode!;
                while (el.firstChild) parent.insertBefore(el.firstChild, el);
                parent.removeChild(el);
              }
            }
          }
          p = p.parentNode;
        }
      }
    } else {
      for (const t of textNodes) {
        let direct = t.parentNode;
        if (direct && (direct as HTMLElement).tagName === "SPAN") {
          const el = direct as HTMLElement;
          if (normalizeColor(el.style.getPropertyValue("background-color")) === targetBg &&
              normalizeColor(el.style.getPropertyValue("color")) === targetFg) {
            continue;
          }
        }
        const span = document.createElement("span");
        span.style.backgroundColor = bg;
        span.style.color = fg;
        span.style.padding = "0 2px";
        span.style.borderRadius = "2px";
        const parent = t.parentNode!;
        parent.insertBefore(span, t);
        span.appendChild(t);
      }
    }
  };

  /** 合并 parent 下相邻的同样式 span（用于应用样式后清理嵌套） */
  const mergeAdjacentSpans = (parent: HTMLElement, styleKey: string, targetValue: string) => {
    if (!parent || !parent.children) return;
    const children = Array.from(parent.children);
    for (let i = 0; i < children.length - 1; i++) {
      const a = children[i] as HTMLElement;
      const b = children[i + 1] as HTMLElement;
      if (
        a.tagName === "SPAN" && b.tagName === "SPAN" &&
        a.style.getPropertyValue(styleKey).toLowerCase().trim() === targetValue.toLowerCase().trim() &&
        b.style.getPropertyValue(styleKey).toLowerCase().trim() === targetValue.toLowerCase().trim() &&
        a.style.cssText === b.style.cssText
      ) {
        while (b.firstChild) a.appendChild(b.firstChild);
        parent.removeChild(b);
        children.splice(i + 1, 1);
        i--;
      }
    }
  };

  /**
   * 把 fragment 内的所有匹配 (bg, fg) 样式的 span 的样式属性剥掉。
   * 把外层 span unwrap 合并回父级（避免空 span）。
   */
  const stripHighlightInFragment = (frag: DocumentFragment, bg: string, fg: string) => {
    const targetBg = bg.toLowerCase();
    const targetFg = fg.toLowerCase();
    const spans = Array.from(frag.querySelectorAll("span"));
    for (const sp of spans) {
      const spBg = (sp.style.getPropertyValue("background-color") || "").toLowerCase().trim();
      const spFg = (sp.style.getPropertyValue("color") || "").toLowerCase().trim();
      if (spBg === targetBg && spFg === targetFg && spBg !== "") {
        // 剥掉样式后，unwrap 这个 span
        const parent = sp.parentNode!;
        while (sp.firstChild) {
          parent.insertBefore(sp.firstChild, sp);
        }
        parent.removeChild(sp);
      }
    }
  };

  /** 把 fragment 内的所有匹配 targetStyle (font-family 或 font-size) 的 span 的该属性剥掉，再 unwrap */
  const stripStyleInFragment = (frag: DocumentFragment, styleKey: string, targetValue: string) => {
    const spans = Array.from(frag.querySelectorAll("span"));
    const target = targetValue.toLowerCase().trim();
    for (const sp of spans) {
      const cur = (sp.style.getPropertyValue(styleKey) || "").toLowerCase().trim();
      if (cur === target && cur !== "") {
        sp.style.removeProperty(styleKey);
        // unwrap
        const parent = sp.parentNode!;
        while (sp.firstChild) {
          parent.insertBefore(sp.firstChild, sp);
        }
        parent.removeChild(sp);
      }
    }
  };

  /**
   * 检测当前选区内的所有文本节点，是否**每一个**都被拥有目标样式（styleKey == targetValue）的 span 覆盖。
   * 注意：必须在 extractContents() 之前调用。
   */
  const isSelectionFullyStyled = (styleKey: string, targetValue: string): boolean => {
    if (!ref.current) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return false;

    const target = targetValue.toLowerCase().trim();
    const root: Node = range.commonAncestorContainer;

    // 用 NodeIterator 拿到选区内所有文本节点
    const iter = (root.nodeType === Node.TEXT_NODE ? [root as Text] : Array.from(document.createTreeWalker(root, NodeFilter.SHOW_TEXT))) as Text[] | TreeWalker;
    const nodes: Text[] = [];
    if (Array.isArray(iter)) {
      for (const t of iter) {
        if (range.intersectsNode(t)) nodes.push(t);
      }
    } else {
      let n: Node | null = (iter as TreeWalker).nextNode();
      while (n) {
        if (range.intersectsNode(n)) nodes.push(n as Text);
        n = (iter as TreeWalker).nextNode();
      }
    }

    if (nodes.length === 0) return false;

    for (const textNode of nodes) {
      let matched = false;
      let p: Node | null = textNode.parentNode;
      while (p && p !== ref.current) {
        if (p.nodeType === 1) {
          const el = p as HTMLElement;
          if (el.tagName === "SPAN") {
            const cur = (el.style.getPropertyValue(styleKey) || "").toLowerCase().trim();
            if (cur === target && cur !== "") {
              matched = true;
              break;
            }
          }
        }
        p = p.parentNode;
      }
      if (!matched) return false;
    }
    return true;
  };

  /**
   * 检测当前选区内的所有文本节点，是否**每一个**都已被背景色 == bg 且 color == fg 的 span 覆盖。
   */
  const isSelectionFullyHighlightedByColor = (bg: string, fg: string): boolean => {
    if (!ref.current) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return false;

    const targetBg = normalizeColor(bg);
    const targetFg = normalizeColor(fg);
    const root: Node = range.commonAncestorContainer;

    const walker = document.createTreeWalker(
      root.nodeType === Node.TEXT_NODE ? root.parentNode! : root,
      NodeFilter.SHOW_TEXT,
    );
    const nodes: Text[] = [];
    let n: Node | null = walker.nextNode();
    while (n) {
      if (range.intersectsNode(n)) nodes.push(n as Text);
      n = walker.nextNode();
    }
    if (root.nodeType === Node.TEXT_NODE && !nodes.includes(root as Text)) {
      nodes.push(root as Text);
    }
    if (nodes.length === 0) return false;

    // 简化判断：只要选区内**任一**文本节点被 (bg, fg) 匹配覆盖，就视为已高亮。
    // 配合无脑取消分支（剥选区内所有匹配 span），即使边界跨越也能彻底取消。
    for (const textNode of nodes) {
      let matched = false;
      let p: Node | null = textNode.parentNode;
      while (p && p !== ref.current) {
        if (p.nodeType === 1) {
          const el = p as HTMLElement;
          if (el.tagName === "SPAN") {
            const spBg = normalizeColor(el.style.getPropertyValue("background-color"));
            const spFg = normalizeColor(el.style.getPropertyValue("color"));
            if (spBg === targetBg && spFg === targetFg && spBg !== "") {
              matched = true;
              break;
            }
          }
        }
        p = p.parentNode;
      }
      if (matched) return true;
    }
    return false;
  };

  // ====== 应用函数 ======

  /**
   * 把任何 CSS 颜色值（hex / rgb / rgba / 命名色）规范化成 "rgb(r, g, b)" 小写字符串。
   * 浏览器在序列化 inline style 时会把 #bbf7d0 转成 rgb(187, 247, 208)，
   * 因此比较颜色时必须先解析到统一形式。
   * 用一个隐藏元素 + getComputedStyle 来稳定解析。
   */
  const normalizeColor = (val: string): string => {
    if (!val) return "";
    const trimmed = val.trim().toLowerCase();
    if (trimmed === "transparent" || trimmed === "inherit" || trimmed === "initial" || trimmed === "") return trimmed;
    if (typeof document === "undefined") return trimmed;
    const probe = document.createElement("span");
    probe.style.color = "";
    probe.style.backgroundColor = "";
    probe.style.color = val;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color; // 浏览器规范化后的值
    document.body.removeChild(probe);
    return (c || "").toLowerCase().trim();
  };

  /** 规范化字体值（去除多余空白、统一大小写） */
  const normalizeFont = (val: string): string => {
    return (val || "").toLowerCase().replace(/\s+/g, " ").trim();
  };

  /** 规范化字号值（统一为 "16px" 格式） */
  const normalizeSize = (val: string): string => {
    const v = (val || "").toLowerCase().trim();
    if (!v) return "";
    if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
    return v;
  };

  /**
   * 应用字体：
   * - 有选区 → 给选区内容套 span；如果已全部是该字体则取消
   * - 没有选区 → 在光标处插入一个带样式的占位 span，让后续输入继承该字体
   */
  const applyFont = (css: string) => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    const hasSelection = !!sel && sel.rangeCount > 0 && !sel.isCollapsed &&
      ref.current.contains(sel.getRangeAt(0).commonAncestorContainer);
    if (!hasSelection) {
      insertStyleAtCursor((el) => { el.style.fontFamily = css; });
      emitChange();
      return;
    }
    const range = sel!.getRangeAt(0);
    // 检测选区内文本是否**全部**处于同一字体下 → 走取消；否则应用
    if (isSelectionFullyStyled("font-family", css)) {
      // 取消：移除选区内所有 font-family == css 的 span 上的该属性，必要时 unwrap
      toggleStyleOnRange(range, "font-family", css, /*remove*/ true);
    } else {
      // 应用：对选区套一层带 font-family 的 span
      toggleStyleOnRange(range, "font-family", css, /*remove*/ false);
    }
    sel!.removeAllRanges();
    emitChange();
  };

  /** 应用字号：同 applyFont 逻辑 */
  const applySize = (px: string) => {
    if (!ref.current) return;
    ref.current.focus();
    const sizeStr = `${px}px`;
    const sel = window.getSelection();
    const hasSelection = !!sel && sel.rangeCount > 0 && !sel.isCollapsed &&
      ref.current.contains(sel.getRangeAt(0).commonAncestorContainer);
    if (!hasSelection) {
      insertStyleAtCursor((el) => { el.style.fontSize = sizeStr; });
      emitChange();
      return;
    }
    const range = sel!.getRangeAt(0);
    if (isSelectionFullyStyled("font-size", sizeStr)) {
      toggleStyleOnRange(range, "font-size", sizeStr, true);
    } else {
      toggleStyleOnRange(range, "font-size", sizeStr, false);
    }
    sel!.removeAllRanges();
    emitChange();
  };

  /**
   * 高亮：
   * - 必须先选区
   * - 若整选区已被同 (bg, fg) 高亮覆盖 → 取消（剥属性 + unwrap）
   * - 否则 → 应用
   */
  const applyHighlight = (bg: string, fg: string) => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;

    const already = isSelectionFullyHighlightedByColor(bg, fg);
    if (already) {
      // 取消：剥掉选区内所有匹配 (bg, fg) 的 span 的样式属性，并 unwrap 空 span
      toggleHighlightOnRange(range, bg, fg, /*remove*/ true);
    } else {
      // 应用：对选区套一个 highlight span
      toggleHighlightOnRange(range, bg, fg, /*remove*/ false);
    }
    sel.removeAllRanges();
    emitChange();
  };

  // 清除格式：去掉所有 span 上的 inline style
  const clearFormat = () => {
    if (!ref.current) return;
    ref.current.focus();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && ref.current.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      const frag = range.extractContents();
      // 递归剥离 span style
      const walker = document.createTreeWalker(frag, NodeFilter.SHOW_ELEMENT);
      let n: Node | null = walker.currentNode as Node;
      while (n) {
        if (n.nodeType === 1) {
          const el = n as HTMLElement;
          el.removeAttribute("style");
        }
        n = walker.nextNode();
      }
      range.insertNode(frag);
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(frag);
      sel.addRange(newRange);
    } else {
      // 没有选区：清掉整个编辑器格式
      ref.current.innerHTML = ref.current.textContent || "";
    }
    emitChange();
  };

  return (
    <div className={cn("border rounded-md bg-background", className)}>
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5 bg-muted/30">
        <Type className="h-3.5 w-3.5 text-muted-foreground" />
        <select
          onChange={(e) => {
            const opt = FONT_OPTIONS.find((o) => o.value === e.target.value);
            if (opt) applyFont(opt.css);
            e.target.value = "";
          }}
          defaultValue=""
          className="h-7 text-xs rounded border bg-background px-1.5"
          title="字体"
        >
          <option value="" disabled>字体</option>
          {FONT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) {
              applySize(e.target.value);
              e.target.value = "";
            }
          }}
          defaultValue=""
          className="h-7 text-xs rounded border bg-background px-1.5"
          title="字号"
        >
          <option value="" disabled>字号</option>
          {SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="h-5 w-px bg-border mx-0.5" />

        <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.bg}
            type="button"
            onClick={() => applyHighlight(c.bg, c.fg)}
            title={`高亮 - ${c.name}`}
            className="h-5 w-5 rounded border border-border/60 hover:scale-110 transition-transform"
            style={{ backgroundColor: c.bg }}
          />
        ))}

        <div className="h-5 w-px bg-border mx-0.5" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFormat}
          className="h-7 px-2 text-xs"
          title="清除格式"
        >
          <Eraser className="h-3.5 w-3.5" />
        </Button>

        <span className="ml-auto text-[10px] text-muted-foreground">
          选字体/字号 → 后续输入自动应用
        </span>
      </div>

      {/* 编辑区 */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          cleanupZeroWidthAfterInput();
          emitChange();
        }}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="px-3 py-2 text-sm focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60"
        style={{ minHeight }}
      />
    </div>
  );
}

/**
 * 把 HTML 安全地展示（已经过滤掉危险标签）
 * - 渲染时保留高亮 / 字体颜色 / 字号
 */
export function RichNoteView({
  html,
  className,
  emptyText = "（未填写）",
}: {
  html: string | null | undefined;
  className?: string;
  emptyText?: string;
}) {
  if (!html || html.trim() === "" || html === "<br>") {
    return <p className="text-sm text-muted-foreground italic">{emptyText}</p>;
  }
  return (
    <div
      className={cn("text-sm leading-relaxed prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(html) }}
    />
  );
}

/**
 * 最小白名单清洗：只保留 <span style="..."> 和文本节点
 * - 移除 <script>, <iframe>, event handlers
 * - style 只保留 background-color / color / font-family / font-size / padding / border-radius
 */
function sanitizeInlineHtml(html: string): string {
  if (typeof window === "undefined") return html; // SSR: 不清洗，让客户端再过一遍
  const ALLOWED_STYLE_KEYS = new Set([
    "background-color",
    "color",
    "font-family",
    "font-size",
    "padding",
    "border-radius",
  ]);
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const clean = (el: Element) => {
    // 递归遍历：只保留白名单属性
    Array.from(el.children).forEach((child) => clean(child));
    if (el.tagName.toLowerCase() === "span") {
      const style = el.getAttribute("style") || "";
      const kept: string[] = [];
      style.split(";").forEach((rule) => {
        const [k, v] = rule.split(":").map((s) => (s || "").trim().toLowerCase());
        if (k && v && ALLOWED_STYLE_KEYS.has(k)) {
          kept.push(`${k}: ${v}`);
        }
      });
      if (kept.length > 0) el.setAttribute("style", kept.join("; "));
      else el.removeAttribute("style");
    } else {
      // 非 span 标签：去掉所有属性，只保留文本
      Array.from(el.attributes).forEach((attr) => el.removeAttribute(attr.name));
    }
  };
  clean(root);
  return root.innerHTML;
}
