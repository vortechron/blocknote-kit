// src/BlockEditor.jsx
import React8, { useEffect as useEffect3, useMemo, useRef as useRef3 } from "react";
import { filterSuggestionItems } from "@blocknote/core";
import {
  AddBlockButton,
  DragHandleButton,
  FilePanelController as FilePanelController2,
  FormattingToolbarController,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  useCreateBlockNote
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

// src/video-embed.js
var EMBED_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
function videoEmbedUrl(url) {
  if (typeof url !== "string" || url.trim() === "") {
    return null;
  }
  return youTubeEmbedUrl(url) ?? vimeoEmbedUrl(url) ?? loomEmbedUrl(url);
}
function youTubeEmbedUrl(url) {
  const match = url.match(/youtube(?:-nocookie)?\.com\/watch\?.*v=([\w-]{6,})/) ?? url.match(/youtube(?:-nocookie)?\.com\/(?:shorts|embed|live|v)\/([\w-]{6,})/) ?? url.match(/youtu\.be\/([\w-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}
function vimeoEmbedUrl(url) {
  const event = url.match(/vimeo\.com\/event\/(\d+)/);
  if (event) {
    return `https://vimeo.com/event/${event[1]}/embed`;
  }
  const match = url.match(/vimeo\.com\/(?:[\w-]+\/)*?(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (!match) {
    return null;
  }
  const hash = match[2] ?? url.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1] ?? "";
  const embed = `https://player.vimeo.com/video/${match[1]}`;
  return hash === "" ? embed : `${embed}?h=${hash}`;
}
function loomEmbedUrl(url) {
  const match = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  return match ? `https://www.loom.com/embed/${match[1]}` : null;
}
function withVideoEmbeds(blockSpecs) {
  const spec = blockSpecs.video;
  if (typeof spec?.implementation?.render !== "function") {
    return blockSpecs;
  }
  const render = spec.implementation.render;
  return {
    ...blockSpecs,
    video: {
      ...spec,
      implementation: {
        ...spec.implementation,
        // A plain method, not an arrow: BlockNote calls render() with a
        // `this` carrying the block's DOM attributes, and the original
        // reads it.
        render(block, editor) {
          const result = render.call(this, block, editor);
          swapForEmbed(result?.dom, block, videoEmbedUrl(block?.props?.url));
          return result;
        }
      }
    }
  };
}
function swapForEmbed(dom, block, embedUrl) {
  const video = embedUrl ? dom?.querySelector?.("video.bn-visual-media") : null;
  if (!video) {
    return;
  }
  const iframe = document.createElement("iframe");
  iframe.className = "bn-visual-media bnk-video-embed";
  iframe.src = embedUrl;
  iframe.allow = EMBED_ALLOW;
  iframe.allowFullscreen = true;
  iframe.contentEditable = "false";
  iframe.draggable = false;
  if (block?.props?.previewWidth) {
    iframe.width = block.props.previewWidth;
  }
  video.replaceWith(iframe);
}

// src/appearance.js
var SPACING = { none: "0", sm: "1rem", md: "2rem", lg: "3.5rem", xl: "6rem" };
var FLUID_SPACING = {
  none: "0",
  sm: "1rem",
  md: "clamp(1.25rem, 3.2vw, 2rem)",
  lg: "clamp(1.5rem, 5vw, 3.5rem)",
  xl: "clamp(1.5rem, 7.5vw, 6rem)"
};
var CONTENT_WIDTHS = { narrow: "42rem", normal: "53rem", wide: "72rem", full: "none" };
var POSITIONS = {
  center: "center",
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  "top-left": "top left",
  "top-right": "top right",
  "bottom-left": "bottom left",
  "bottom-right": "bottom right"
};
var DEFAULT_TINT_COLOR = "#0f172a";
var MAX_BLUR = 20;
var DEFAULT_APPEARANCE = Object.freeze({
  backgroundType: null,
  backgroundColor: null,
  backgroundImageUrl: null,
  backgroundVideoUrl: null,
  tintColor: DEFAULT_TINT_COLOR,
  tintStyle: "normal",
  tintOpacity: 45,
  position: "center",
  blur: 0,
  card: false,
  padding: "md",
  contentWidth: "normal",
  fullHeight: false
});
function hexColor(value, fallback = null) {
  const match = /^#?([0-9a-f]{6})$/i.exec(typeof value === "string" ? value.trim() : "");
  return match ? `#${match[1].toLowerCase()}` : fallback;
}
function isDarkColor(value) {
  const hex = hexColor(value);
  if (hex === null) {
    return false;
  }
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return (red * 299 + green * 587 + blue * 114) / 1e3 < 128;
}
function clamp(value, min, max) {
  const number = Number.parseInt(value, 10);
  return Math.min(Math.max(Number.isNaN(number) ? min : number, min), max);
}
function resolveBackgroundType(appearance) {
  if (["color", "image", "video"].includes(appearance.backgroundType)) {
    return appearance.backgroundType;
  }
  if (appearance.backgroundVideoUrl) {
    return "video";
  }
  return appearance.backgroundImageUrl ? "image" : "color";
}
function backgroundVideoEmbedUrl(url) {
  const embed = videoEmbedUrl(url);
  if (embed === null) {
    return null;
  }
  const youTube = /youtube-nocookie\.com\/embed\/([\w-]+)/.exec(embed);
  if (youTube) {
    return withQuery(embed, {
      autoplay: 1,
      mute: 1,
      loop: 1,
      playlist: youTube[1],
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      disablekb: 1,
      iv_load_policy: 3
    });
  }
  if (embed.includes("player.vimeo.com/")) {
    return withQuery(embed, { background: 1, autoplay: 1, muted: 1, loop: 1 });
  }
  return withQuery(embed, { autoplay: 1, muted: 1 });
}
function withQuery(url, parameters) {
  const query = new URLSearchParams(Object.entries(parameters).map(([key, value]) => [key, String(value)]));
  return url + (url.includes("?") ? "&" : "?") + query.toString();
}
function appearanceToSurface(input = {}) {
  const appearance = { ...DEFAULT_APPEARANCE, ...withoutUndefined(input) };
  const padding = FLUID_SPACING[appearance.padding] ?? FLUID_SPACING.md;
  const width = CONTENT_WIDTHS[appearance.contentWidth] ?? CONTENT_WIDTHS.normal;
  const style = {
    padding,
    "--bnk-block-pad": padding,
    "--bnk-block-width": width === "none" ? "100%" : width
  };
  if (appearance.fullHeight) {
    style.minHeight = "70vh";
  }
  const type = resolveBackgroundType(appearance);
  if (type === "color") {
    const color = hexColor(appearance.backgroundColor);
    if (color === null) {
      return { className: "", style, video: null };
    }
    return {
      className: ["bnk-blocknote-has-bg", isDarkColor(color) ? "bnk-blocknote-light-text" : null].filter(Boolean).join(" "),
      style: { ...style, backgroundColor: color },
      video: null
    };
  }
  const mediaUrl = type === "image" ? appearance.backgroundImageUrl : appearance.backgroundVideoUrl;
  if (!mediaUrl) {
    return { className: "", style, video: null };
  }
  const classes = [
    "bnk-blocknote-has-bg",
    "bnk-blocknote-has-media",
    appearance.card ? "bnk-blocknote-card" : "bnk-blocknote-light-text"
  ];
  style["--bnk-bg-tint"] = hexColor(appearance.tintColor, DEFAULT_TINT_COLOR);
  style["--bnk-bg-tint-opacity"] = String(clamp(appearance.tintOpacity ?? 45, 0, 100) / 100);
  style["--bnk-bg-tint-blend"] = appearance.tintStyle === "blend" ? "multiply" : "normal";
  style["--bnk-bg-position"] = POSITIONS[appearance.position] ?? "center";
  style["--bnk-bg-blur"] = `${clamp(appearance.blur ?? 0, 0, MAX_BLUR)}px`;
  if (type === "image") {
    style["--bnk-bg-image"] = `url(${JSON.stringify(String(mediaUrl))})`;
    return { className: classes.join(" "), style, video: null };
  }
  style.backgroundColor = "#1e293b";
  const embed = backgroundVideoEmbedUrl(mediaUrl);
  return {
    className: classes.join(" "),
    style,
    video: { embed: embed !== null, url: embed ?? mediaUrl }
  };
}
function withoutUndefined(object) {
  return Object.fromEntries(Object.entries(object ?? {}).filter(([, value]) => value !== void 0));
}

// src/insert-text.js
var TEXT_FIELD_SELECTOR = 'input:not([type]), input[type="text"], textarea';
var editors = /* @__PURE__ */ new WeakMap();
var noTarget = { kind: null, editor: null, field: null, start: null, end: null };
var target = noTarget;
function registerEditor(mountElement, editor) {
  editors.set(mountElement, editor);
}
function rememberCaret(field) {
  target = { ...target, start: field.selectionStart, end: field.selectionEnd };
}
function trackFocus(event) {
  const element = event.target;
  if (!(element instanceof HTMLElement) || element.closest('dialog, [role="dialog"], .fi-modal')) {
    return;
  }
  const mountElement = element.closest("[data-bnk-editor]");
  if (mountElement && editors.has(mountElement)) {
    target = { ...noTarget, kind: "editor", editor: editors.get(mountElement) };
    return;
  }
  if (element.matches(TEXT_FIELD_SELECTOR)) {
    target = { ...noTarget, kind: "field", field: element };
    rememberCaret(element);
  }
}
function trackCaret(event) {
  if (target.kind === "field" && event.target === target.field) {
    rememberCaret(target.field);
  }
}
function trackSelection() {
  if (target.kind === "field" && document.activeElement === target.field) {
    rememberCaret(target.field);
  }
}
function insertIntoField(field, token) {
  const start = target.start ?? field.value.length;
  const end = target.end ?? start;
  field.setRangeText(token, start, end, "end");
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  target = { ...target, start: start + token.length, end: start + token.length };
}
function insertText(token) {
  if (target.kind === "editor" && target.editor) {
    target.editor.insertInlineContent(token);
    return "inserted";
  }
  if (target.kind === "field" && target.field?.isConnected) {
    insertIntoField(target.field, token);
    return "inserted";
  }
  navigator.clipboard?.writeText(token).catch(() => {
  });
  return "copied";
}
var tracking = false;
function trackTextTargets() {
  if (tracking || typeof document === "undefined") {
    return;
  }
  tracking = true;
  document.addEventListener("focusin", trackFocus);
  document.addEventListener("keyup", trackCaret);
  document.addEventListener("mouseup", trackCaret);
  document.addEventListener("input", trackCaret);
  document.addEventListener("selectionchange", trackSelection);
}

// src/item-width.jsx
import React2, { useCallback, useEffect, useRef, useState } from "react";
import { createBlockSpecFromTiptapNode, propsToAttributes } from "@blocknote/core";
import { ColumnListBlock } from "@blocknote/xl-multi-column";

// src/item-spacing.jsx
import React from "react";
import { SideMenuExtension } from "@blocknote/core";
import {
  BlockColorsItem,
  DragHandleMenu,
  RemoveBlockItem,
  TableColumnHeaderItem,
  TableRowHeaderItem,
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useExtensionState
} from "@blocknote/react";
import { jsx, jsxs } from "react/jsx-runtime";
var ITEM_SPACING = {
  none: "0",
  sm: "1rem",
  md: "2rem",
  lg: "3.5rem",
  xl: "6rem"
};
var SIZES = Object.keys(ITEM_SPACING);
var LABELS = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large"
};
var SPACING_PROP_SCHEMA = {
  spaceTop: { default: "none", values: SIZES },
  spaceBottom: { default: "none", values: SIZES }
};
function BlockSpacingItem({ prop, label }) {
  const Components = useComponentsContext();
  const editor = useBlockNoteEditor();
  const block = useExtensionState(SideMenuExtension, { selector: (state) => state?.block });
  if (!Components || block === void 0 || !(prop in (block.props ?? {}))) {
    return null;
  }
  const current = block.props[prop] ?? "none";
  return /* @__PURE__ */ jsxs(Components.Generic.Menu.Root, { position: "right", sub: true, children: [
    /* @__PURE__ */ jsx(Components.Generic.Menu.Trigger, { sub: true, children: /* @__PURE__ */ jsx(Components.Generic.Menu.Item, { className: "bn-menu-item", subTrigger: true, children: label }) }),
    /* @__PURE__ */ jsx(Components.Generic.Menu.Dropdown, { sub: true, className: "bn-menu-dropdown", children: SIZES.map((size) => /* @__PURE__ */ jsx(
      Components.Generic.Menu.Item,
      {
        checked: current === size,
        onClick: () => {
          try {
            editor.updateBlock(block, { props: { [prop]: size } });
          } catch (error) {
            console.error("Could not change item spacing:", error);
          }
        },
        children: LABELS[size]
      },
      size
    )) })
  ] });
}
function SpacingDragHandleMenu() {
  const dictionary = useDictionary();
  return /* @__PURE__ */ jsxs(DragHandleMenu, { children: [
    /* @__PURE__ */ jsx(RemoveBlockItem, { children: dictionary.drag_handle.delete_menuitem }),
    /* @__PURE__ */ jsx(BlockColorsItem, { children: dictionary.drag_handle.colors_menuitem }),
    /* @__PURE__ */ jsx(TableRowHeaderItem, { children: dictionary.drag_handle.header_row_menuitem }),
    /* @__PURE__ */ jsx(TableColumnHeaderItem, { children: dictionary.drag_handle.header_column_menuitem }),
    /* @__PURE__ */ jsx(BlockSpacingItem, { prop: "spaceTop", label: "Space above" }),
    /* @__PURE__ */ jsx(BlockSpacingItem, { prop: "spaceBottom", label: "Space below" })
  ] });
}

// src/item-width.jsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var WIDTH_COLUMNS = 12;
var BLEED_STEPS = 6;
var MAX_COLUMNS = WIDTH_COLUMNS + BLEED_STEPS;
var MIN_COLUMNS = 2;
var HOVER_SLACK = 28;
var RESIZABLE_TYPES = /* @__PURE__ */ new Set([
  "paragraph",
  "heading",
  "quote",
  "codeBlock",
  "image",
  "video",
  "audio",
  "file",
  "table"
]);
function withItemProps(blockSpecs) {
  return Object.fromEntries(
    Object.entries(blockSpecs).map(([type, spec]) => {
      if (!RESIZABLE_TYPES.has(type)) {
        return [type, spec];
      }
      return [
        type,
        {
          ...spec,
          config: {
            ...spec.config,
            propSchema: {
              ...spec.config.propSchema,
              width: { default: WIDTH_COLUMNS },
              ...SPACING_PROP_SCHEMA
            }
          }
        }
      ];
    })
  );
}
var RESIZABLE_SELECTOR = ".bn-block-content, .bn-block-column-list";
function resizableElementAt(node, container) {
  const element = node instanceof Element ? node.closest(RESIZABLE_SELECTOR) : null;
  if (!element || !container.contains(element)) {
    return null;
  }
  if (element.classList.contains("bn-block-column-list")) {
    return element;
  }
  return RESIZABLE_TYPES.has(element.getAttribute("data-content-type")) ? element : null;
}
function blockIdOf(element) {
  return element.closest("[data-id]")?.getAttribute("data-id") ?? null;
}
function columnListWithItemProps() {
  const extraProps = { width: { default: WIDTH_COLUMNS }, ...SPACING_PROP_SCHEMA };
  const node = ColumnListBlock.implementation.node.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        ...propsToAttributes(extraProps)
      };
    }
  });
  return createBlockSpecFromTiptapNode(
    { node, type: "columnList", content: "none" },
    { ...ColumnListBlock.config.propSchema, ...extraProps },
    ColumnListBlock.extensions
  );
}
function rowRectOf(element) {
  return (element.parentElement ?? element).getBoundingClientRect();
}
function pointerNearBox(event, layer, box) {
  if (!box || !layer) {
    return false;
  }
  const base = layer.getBoundingClientRect();
  const x = event.clientX - base.left;
  const y = event.clientY - base.top;
  return x >= box.left - HOVER_SLACK && x <= box.left + box.width + HOVER_SLACK && y >= box.top - HOVER_SLACK && y <= box.top + box.height + HOVER_SLACK;
}
function widthForColumns(columns, rowWidth, blockWidth) {
  if (columns <= WIDTH_COLUMNS) {
    return columns / WIDTH_COLUMNS * rowWidth;
  }
  const stretch = Math.max(0, blockWidth - rowWidth);
  return rowWidth + (columns - WIDTH_COLUMNS) / BLEED_STEPS * stretch;
}
function columnsForWidth(width, rowWidth, blockWidth, canStretch) {
  if (rowWidth <= 0) {
    return WIDTH_COLUMNS;
  }
  const stretch = blockWidth - rowWidth;
  if (width <= rowWidth || !canStretch || stretch <= 0) {
    return Math.min(WIDTH_COLUMNS, Math.max(MIN_COLUMNS, Math.round(width / rowWidth * WIDTH_COLUMNS)));
  }
  const step = Math.round((width - rowWidth) / stretch * BLEED_STEPS);
  return WIDTH_COLUMNS + Math.min(BLEED_STEPS, Math.max(0, step));
}
function readoutFor(columns) {
  if (columns === MAX_COLUMNS) {
    return "Edge to edge";
  }
  if (columns > WIDTH_COLUMNS) {
    return `Past padding ${columns - WIDTH_COLUMNS} / ${BLEED_STEPS}`;
  }
  return `${columns} / ${WIDTH_COLUMNS}`;
}
function BlockItemControls({ editor, editable }) {
  const [layer, setLayer] = useState(null);
  const blockIdRef = useRef(null);
  const draggingRef = useRef(false);
  const [box, setBox] = useState(null);
  const boxRef = useRef(null);
  const [pinnedId, setPinnedId] = useState(null);
  const pinnedRef = useRef(null);
  const [dragColumns, setDragColumns] = useState(null);
  pinnedRef.current = pinnedId;
  const wrapper = layer?.closest(".bnk-blocknote") ?? null;
  useEffect(() => {
    if (!wrapper) {
      return void 0;
    }
    const sync = () => {
      wrapper.style.setProperty("--bnk-bleed-full", `${wrapper.getBoundingClientRect().width}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [wrapper]);
  const elementForBlock = useCallback(
    (blockId) => {
      const container = layer?.parentElement;
      if (!blockId || !container) {
        return null;
      }
      const id = CSS.escape(blockId);
      return container.querySelector(
        `[data-id="${id}"] > .bn-block-content, .bn-block-column-list[data-id="${id}"]`
      );
    },
    [layer]
  );
  const measure = useCallback(() => {
    const element = elementForBlock(blockIdRef.current);
    if (!element || !layer) {
      boxRef.current = null;
      setBox(null);
      return;
    }
    const item = element.getBoundingClientRect();
    const row = rowRectOf(element);
    const base = layer.getBoundingClientRect();
    const block = wrapper ? wrapper.getBoundingClientRect() : row;
    const next = {
      left: item.left - base.left,
      top: item.top - base.top,
      width: item.width,
      height: item.height,
      rowWidth: row.width,
      blockLeft: block.left - base.left,
      blockWidth: block.width
    };
    boxRef.current = next;
    setBox(next);
  }, [elementForBlock, layer, wrapper]);
  const track = useCallback(
    (element) => {
      blockIdRef.current = element ? blockIdOf(element) : null;
      measure();
    },
    [measure]
  );
  useEffect(() => {
    const container = layer?.parentElement;
    if (!container || !editable) {
      return void 0;
    }
    const onPointerMove = (event) => {
      if (draggingRef.current || pinnedRef.current) {
        return;
      }
      if (event.target instanceof Element && event.target.closest(".bnk-width-layer")) {
        return;
      }
      const element = resizableElementAt(event.target, container);
      if (!element && blockIdRef.current && pointerNearBox(event, layer, boxRef.current)) {
        return;
      }
      track(element);
    };
    const onPointerLeave = () => {
      if (!draggingRef.current && !pinnedRef.current) {
        track(null);
      }
    };
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [layer, editable, track]);
  useEffect(() => {
    const container = layer?.parentElement;
    if (!container || !editable) {
      return void 0;
    }
    const onPointerDown = (event) => {
      if (!(event.target instanceof Element) || !event.target.closest(".bn-editor")) {
        return;
      }
      const element = resizableElementAt(event.target, container);
      setPinnedId(element ? blockIdOf(element) : null);
      if (!element) {
        track(null);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape" && pinnedRef.current) {
        setPinnedId(null);
        track(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [layer, editable, track]);
  useEffect(() => {
    if (!pinnedId) {
      return void 0;
    }
    blockIdRef.current = pinnedId;
    measure();
    const remeasure = () => requestAnimationFrame(measure);
    const unsubscribe = editor.onChange(remeasure);
    const observer = wrapper ? new ResizeObserver(remeasure) : null;
    observer?.observe(wrapper);
    return () => {
      unsubscribe?.();
      observer?.disconnect();
    };
  }, [pinnedId, editor, measure, wrapper]);
  const onHandleDown = useCallback(
    (event) => {
      const blockId = blockIdRef.current;
      const element = elementForBlock(blockId);
      if (!element) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
      }
      draggingRef.current = true;
      setPinnedId(blockId);
      const rowWidth = rowRectOf(element).width;
      const blockWidth = wrapper ? wrapper.getBoundingClientRect().width : rowWidth;
      const canStretch = !element.closest(".bn-block-column");
      const scale = element.getAttribute("data-text-alignment") === "center" ? 2 : 1;
      const direction = event.currentTarget.classList.contains("is-start") ? -1 : 1;
      const startX = event.clientX;
      let current = Number(element.getAttribute("data-width")) || WIDTH_COLUMNS;
      const startWidth = widthForColumns(current, rowWidth, blockWidth);
      setDragColumns(current);
      const stop = () => {
        draggingRef.current = false;
        setDragColumns(null);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
        requestAnimationFrame(measure);
      };
      const onMove = (moveEvent) => {
        if (!elementForBlock(blockId)) {
          stop();
          return;
        }
        const width = startWidth + direction * (moveEvent.clientX - startX) * scale;
        const columns = columnsForWidth(width, rowWidth, blockWidth, canStretch);
        if (columns === current) {
          return;
        }
        current = columns;
        setDragColumns(columns);
        try {
          editor.updateBlock(blockId, { props: { width: columns } });
        } catch (error) {
          console.error("Could not resize block:", error);
          stop();
          return;
        }
        requestAnimationFrame(measure);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    },
    [editor, elementForBlock, measure, wrapper]
  );
  const dragging = dragColumns !== null;
  const pinned = pinnedId !== null && pinnedId === blockIdRef.current;
  const showFrame = Boolean(editable && box);
  const gutter = box ? Math.max(0, (box.blockWidth - box.rowWidth) / 2) : 0;
  return /* @__PURE__ */ jsxs2("div", { className: "bnk-width-layer", ref: setLayer, children: [
    showFrame && /* @__PURE__ */ jsxs2(
      "div",
      {
        className: ["bnk-width-frame", dragging ? "is-dragging" : "", pinned ? "is-pinned" : ""].filter(Boolean).join(" "),
        style: {
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`
        },
        children: [
          /* @__PURE__ */ jsx2("span", { className: "bnk-width-handle is-start", onPointerDown: onHandleDown }),
          /* @__PURE__ */ jsx2("span", { className: "bnk-width-handle is-end", onPointerDown: onHandleDown }),
          dragging && /* @__PURE__ */ jsx2("span", { className: "bnk-width-readout", children: readoutFor(dragColumns) })
        ]
      }
    ),
    showFrame && dragging && /* @__PURE__ */ jsxs2(
      "div",
      {
        className: "bnk-width-grid",
        style: {
          left: `${box.blockLeft}px`,
          top: `${box.top}px`,
          width: `${box.blockWidth}px`,
          height: `${box.height}px`
        },
        children: [
          /* @__PURE__ */ jsx2("span", { className: "bnk-width-grid-part is-gutter", style: { width: `${gutter}px` }, children: Array.from({ length: BLEED_STEPS }, (_, index) => /* @__PURE__ */ jsx2("span", {}, index)) }),
          /* @__PURE__ */ jsx2("span", { className: "bnk-width-grid-part", style: { width: `${box.rowWidth}px` }, children: Array.from({ length: WIDTH_COLUMNS }, (_, index) => /* @__PURE__ */ jsx2("span", {}, index)) }),
          /* @__PURE__ */ jsx2("span", { className: "bnk-width-grid-part is-gutter", style: { width: `${gutter}px` }, children: Array.from({ length: BLEED_STEPS }, (_, index) => /* @__PURE__ */ jsx2("span", {}, index)) })
        ]
      }
    )
  ] });
}

// src/media-library.jsx
import React4, { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
import { FilePanelExtension } from "@blocknote/core/extensions";
import {
  FilePanelController,
  FileReplaceButton,
  FormattingToolbar,
  getFormattingToolbarItems,
  useBlockNoteEditor as useBlockNoteEditor3,
  useComponentsContext as useComponentsContext3,
  useDictionary as useDictionary2,
  useEditorState as useEditorState2,
  useExtensionState as useExtensionState2
} from "@blocknote/react";

// src/font-family.jsx
import React3 from "react";
import { createStyleSpec } from "@blocknote/core";
import { useBlockNoteEditor as useBlockNoteEditor2, useComponentsContext as useComponentsContext2, useEditorState } from "@blocknote/react";
import { jsx as jsx3 } from "react/jsx-runtime";
var FONT_FAMILY_STYLE = "fontFamily";
var INHERIT = "default";
function fontFamilyStyleSpec(fonts) {
  const stacks = new Map(fonts.map((font) => [font.value, font.stack]));
  return createStyleSpec(
    { type: FONT_FAMILY_STYLE, propSchema: "string" },
    {
      render: (value) => {
        const dom = document.createElement("span");
        const stack = stacks.get(value);
        if (stack) {
          dom.style.fontFamily = stack;
        }
        return { dom, contentDOM: dom };
      }
    }
  );
}
function FontFamilySelect({ fonts }) {
  const editor = useBlockNoteEditor2();
  const Components = useComponentsContext2();
  const active = useEditorState({
    editor,
    selector: ({ editor: editor2 }) => {
      const blocks = editor2.getSelection()?.blocks || [editor2.getTextCursorPosition().block];
      if (!editor2.isEditable || !blocks.find((block) => block.content !== void 0)) {
        return void 0;
      }
      return editor2.getActiveStyles()[FONT_FAMILY_STYLE] || INHERIT;
    }
  });
  if (active === void 0) {
    return null;
  }
  const apply = (value) => {
    if (value === INHERIT) {
      editor.removeStyles({ [FONT_FAMILY_STYLE]: active });
    } else {
      editor.addStyles({ [FONT_FAMILY_STYLE]: value });
    }
    setTimeout(() => editor.focus());
  };
  const items = [{ value: INHERIT, label: "Default font", stack: null }, ...fonts].map((font) => ({
    text: font.label,
    icon: /* @__PURE__ */ jsx3("span", { className: "bnk-font-swatch", style: font.stack ? { fontFamily: font.stack } : void 0, children: "Aa" }),
    isSelected: font.value === active,
    onClick: () => apply(font.value)
  }));
  return /* @__PURE__ */ jsx3(Components.FormattingToolbar.Select, { className: "bn-select", items });
}

// src/media-library.jsx
import { Fragment, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function isLibraryMedia(block) {
  return block?.type === "image" || block?.type === "video";
}
function libraryKindOf(block) {
  if (isLibraryMedia(block)) return block.type;
  return block?.type === "card" ? "image" : null;
}
function mediaProps(block, props) {
  return block.type === "card" ? { url: props.url } : props;
}
function MediaFilePanelController() {
  const editor = useBlockNoteEditor3();
  const blockId = useExtensionState2(FilePanelExtension);
  return libraryKindOf(blockId && editor.getBlock(blockId)) ? null : /* @__PURE__ */ jsx4(FilePanelController, {});
}
function MediaReplaceButton() {
  const editor = useBlockNoteEditor3();
  const Components = useComponentsContext3();
  const dictionary = useDictionary2();
  const block = useEditorState2({
    editor,
    selector: ({ editor: editor2 }) => {
      const blocks = editor2.getSelection()?.blocks || [editor2.getTextCursorPosition().block];
      return editor2.isEditable && blocks.length === 1 ? blocks[0] : void 0;
    }
  });
  if (!isLibraryMedia(block)) return /* @__PURE__ */ jsx4(FileReplaceButton, {});
  const label = dictionary.formatting_toolbar.file_replace.tooltip[block.type];
  return /* @__PURE__ */ jsx4(
    Components.FormattingToolbar.Button,
    {
      className: "bn-button",
      mainTooltip: label,
      label,
      icon: /* @__PURE__ */ jsxs3("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx4("path", { d: "M20 10V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6M3 16l5-5 5 5 3-3M15 20l5-5 2 2-5 5h-2z" }),
        /* @__PURE__ */ jsx4("circle", { cx: "15", cy: "8", r: "1" })
      ] }),
      onClick: () => editor.getExtension(FilePanelExtension).showMenu(block.id)
    }
  );
}
function MediaFormattingToolbar({ fonts = [], useLibrary = true, ...props }) {
  return /* @__PURE__ */ jsx4(FormattingToolbar, { ...props, children: getFormattingToolbarItems(props.blockTypeSelectItems).flatMap((item) => {
    if (item.key === "replaceFileButton" && useLibrary) {
      return /* @__PURE__ */ jsx4(MediaReplaceButton, {}, item.key);
    }
    if (item.key === "blockTypeSelect" && fonts.length > 0) {
      return [item, /* @__PURE__ */ jsx4(FontFamilySelect, { fonts }, "fontFamilySelect")];
    }
    return item;
  }) });
}
function MediaLibraryDialog({ editor, media }) {
  const dialog = useRef2(null);
  const [request, setRequest] = useState2(null);
  const filePanelBlockId = useExtensionState2(FilePanelExtension, { editor });
  const open = request !== null;
  const kind = request?.kind || "";
  const [search, setSearch] = useState2("");
  const [mediaLink, setMediaLink] = useState2("");
  const [page, setPage] = useState2(1);
  const [result, setResult] = useState2({ data: [], last_page: 1 });
  const [loading, setLoading] = useState2(false);
  const [uploading, setUploading] = useState2(false);
  const [error, setError] = useState2("");
  const [refresh, setRefresh] = useState2(0);
  useEffect2(() => {
    const block = filePanelBlockId && editor.getBlock(filePanelBlockId);
    const blockKind = libraryKindOf(block);
    if (!blockKind) return;
    setSearch("");
    setMediaLink("");
    setPage(1);
    setError("");
    setRequest({ blockId: block.id, kind: blockKind });
    editor.getExtension(FilePanelExtension).closeMenu();
  }, [editor, filePanelBlockId]);
  useEffect2(() => {
    if (open) {
      if (!dialog.current.open) dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [open]);
  useEffect2(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const listed = await media.list({ search, page, kind, signal: controller.signal });
        if (controller.signal.aborted) return;
        setResult({ data: listed?.data ?? [], last_page: listed?.last_page ?? 1 });
        setError("");
      } catch (failure) {
        if (failure.name !== "AbortError") setError(failure.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? 300 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, search, page, refresh, media, kind]);
  function choose(asset) {
    try {
      const target2 = editor.getBlock(request.blockId);
      if (!target2) throw new Error("The insertion point changed. Close the library and choose a place in the block again.");
      const type = asset.is_video ? "video" : "image";
      if (libraryKindOf(target2) !== kind || type !== kind) throw new Error("The media type changed. Close the library and select the block again.");
      editor.updateBlock(target2, { props: mediaProps(target2, { url: asset.url, name: asset.name, showPreview: true }) });
      setRequest(null);
    } catch (failure) {
      setError(failure.message);
    }
  }
  function chooseLink() {
    try {
      const url = new URL(mediaLink.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      setError("Enter a full http:// or https:// link.");
      return;
    }
    try {
      const target2 = editor.getBlock(request.blockId);
      if (!target2 || libraryKindOf(target2) !== kind) throw new Error("The block changed. Close the library and select it again.");
      editor.updateBlock(target2, { props: mediaProps(target2, { url: mediaLink.trim(), showPreview: true }) });
      setRequest(null);
    } catch (failure) {
      setError(failure.message);
    }
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (kind && !file.type.startsWith(`${kind}/`)) {
      setError(kind === "image" ? "Choose an image file." : "Choose a video file.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      await media.upload(file);
      setSearch("");
      setPage(1);
      setRefresh((value) => value + 1);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  return /* @__PURE__ */ jsxs3("dialog", { className: "bnk-media-dialog", ref: dialog, "aria-label": "Media library", onClose: () => setRequest(null), children: [
    /* @__PURE__ */ jsxs3("div", { className: "bnk-media-dialog-header", children: [
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx4("h2", { children: "Media library" }),
        /* @__PURE__ */ jsx4("p", { children: kind === "video" ? "Choose a video for this block." : "Choose an image for this block." })
      ] }),
      /* @__PURE__ */ jsx4("button", { type: "button", "aria-label": "Close media library", onClick: () => setRequest(null), children: "\xD7" })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "bnk-media-dialog-tools", children: [
      /* @__PURE__ */ jsx4("input", { "aria-label": "Search media", placeholder: "Search media", value: search, onChange: (event) => {
        setSearch(event.target.value);
        setPage(1);
      } }),
      /* @__PURE__ */ jsxs3("label", { className: "bnk-media-upload", children: [
        uploading ? "Uploading\u2026" : "Upload media",
        /* @__PURE__ */ jsx4("input", { type: "file", accept: kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/gif,image/webp,image/avif", disabled: uploading, onChange: upload })
      ] }),
      /* @__PURE__ */ jsxs3("details", { children: [
        /* @__PURE__ */ jsx4("summary", { children: "Use a link" }),
        /* @__PURE__ */ jsxs3("div", { className: "bnk-media-dialog-tools", children: [
          /* @__PURE__ */ jsx4(
            "input",
            {
              type: "url",
              "aria-label": kind === "image" ? "Image URL" : "Video URL",
              placeholder: "https://",
              value: mediaLink,
              onChange: (event) => setMediaLink(event.target.value),
              onKeyDown: (event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  chooseLink();
                }
              }
            }
          ),
          /* @__PURE__ */ jsx4("button", { className: "bnk-media-upload", type: "button", onClick: chooseLink, children: "Use link" })
        ] })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxs3("p", { role: "alert", className: "bnk-media-error", children: [
      error,
      " ",
      /* @__PURE__ */ jsx4("button", { type: "button", onClick: () => setRefresh((value) => value + 1), children: "Retry" })
    ] }),
    loading && /* @__PURE__ */ jsx4("p", { role: "status", className: "bnk-media-status", children: "Loading media\u2026" }),
    /* @__PURE__ */ jsxs3("div", { className: "bnk-media-dialog-grid", "aria-busy": loading, children: [
      !loading && result.data.map((asset) => /* @__PURE__ */ jsxs3("button", { className: "bnk-library-card", type: "button", "aria-label": `Use ${asset.name}`, onClick: () => choose(asset), children: [
        /* @__PURE__ */ jsx4("div", { className: "bnk-media-thumbnail", children: asset.is_video ? /* @__PURE__ */ jsxs3(Fragment, { children: [
          /* @__PURE__ */ jsx4("video", { src: `${asset.url}#t=0.1`, preload: "metadata", muted: true, playsInline: true }),
          /* @__PURE__ */ jsx4("span", { className: "bnk-media-video-label", children: "\u25B6 Video" })
        ] }) : /* @__PURE__ */ jsx4("img", { src: asset.url, alt: "", loading: "lazy" }) }),
        /* @__PURE__ */ jsx4("span", { className: "bnk-library-card-caption", children: /* @__PURE__ */ jsx4("strong", { children: asset.name }) })
      ] }, asset.id)),
      !loading && !error && !result.data.length && /* @__PURE__ */ jsx4("p", { className: "bnk-media-status", children: "No media found. Upload a file to get started." })
    ] }),
    result.last_page > 1 && /* @__PURE__ */ jsxs3("div", { className: "bnk-library-pagination", children: [
      /* @__PURE__ */ jsx4("button", { type: "button", disabled: page === 1 || loading, onClick: () => setPage((value) => value - 1), children: "Previous" }),
      /* @__PURE__ */ jsxs3("span", { children: [
        page,
        " / ",
        result.last_page
      ] }),
      /* @__PURE__ */ jsx4("button", { type: "button", disabled: page >= result.last_page || loading, onClick: () => setPage((value) => value + 1), children: "Next" })
    ] })
  ] });
}

// src/normalize.js
var OBJECT_KEYS = /* @__PURE__ */ new Set(["props", "styles"]);
function normalizeValue(value, key = null) {
  if (Array.isArray(value)) {
    if (value.length === 0 && OBJECT_KEYS.has(key)) {
      return {};
    }
    return value.map((item) => normalizeValue(item));
  }
  if (value && typeof value === "object") {
    const normalized = Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [childKey, normalizeValue(childValue, childKey)])
    );
    if (normalized.type === "table" && isUntypedTableContent(normalized.content)) {
      normalized.content = { type: "tableContent", ...normalized.content };
    }
    return normalized;
  }
  return value;
}
function isUntypedTableContent(content) {
  return content !== null && typeof content === "object" && !Array.isArray(content) && content.type === void 0 && Array.isArray(content.rows);
}
function normalizeDocument(document2) {
  if (typeof document2 === "string") {
    try {
      document2 = JSON.parse(document2);
    } catch {
      return void 0;
    }
  }
  if (!Array.isArray(document2) || document2.length === 0) {
    return void 0;
  }
  return normalizeValue(document2);
}

// src/schema.jsx
import {
  BlockNoteSchema,
  combineByGroup,
  defaultBlockSpecs,
  defaultStyleSpecs
} from "@blocknote/core";
import { en as coreEn } from "@blocknote/core/locales";
import { getDefaultReactSlashMenuItems } from "@blocknote/react";
import {
  locales as multiColumnLocales2,
  multiColumnDropCursor,
  withMultiColumn
} from "@blocknote/xl-multi-column";

// src/blocks/card.jsx
import React5 from "react";
import { insertOrUpdateBlockForSlashMenu } from "@blocknote/core";
import { FilePanelExtension as FilePanelExtension2 } from "@blocknote/core/extensions";
import { createReactBlockSpec } from "@blocknote/react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var CARD_BUTTON_COLOR = "#f6c343";
var BUTTON_SWATCHES = ["#f6c343", "#153b59", "#111827", "#ffffff"];
function isDark(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!match) return false;
  const value = parseInt(match[1], 16);
  const red = value >> 16 & 255;
  const green = value >> 8 & 255;
  const blue = value & 255;
  return (red * 299 + green * 587 + blue * 114) / 1e3 < 128;
}
function buttonColorOf(block) {
  const color = block.props.buttonColor;
  return /^#[0-9a-f]{6}$/i.test(color || "") ? color.toLowerCase() : CARD_BUTTON_COLOR;
}
var keepSelection = (event) => event.preventDefault();
function CardControls({ block, editor }) {
  const color = buttonColorOf(block);
  const update = (props) => editor.updateBlock(block, { props });
  return /* @__PURE__ */ jsxs4("div", { className: "bnk-card-controls", contentEditable: false, children: [
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        onMouseDown: keepSelection,
        onClick: () => editor.getExtension(FilePanelExtension2).showMenu(block.id),
        children: block.props.url ? "Change banner" : "Add banner image"
      }
    ),
    block.props.url && /* @__PURE__ */ jsx5("button", { type: "button", onMouseDown: keepSelection, onClick: () => update({ url: "" }), children: "Remove banner" }),
    /* @__PURE__ */ jsxs4("span", { className: "bnk-card-swatches", role: "group", "aria-label": "Show button colour", children: [
      BUTTON_SWATCHES.map((swatch) => /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          title: swatch,
          "aria-label": `Button colour ${swatch}`,
          className: swatch === color ? "is-active" : "",
          style: { backgroundColor: swatch },
          onMouseDown: keepSelection,
          onClick: () => update({ buttonColor: swatch })
        },
        swatch
      )),
      /* @__PURE__ */ jsx5(
        "input",
        {
          type: "color",
          value: color,
          title: "Any colour",
          "aria-label": "Any button colour",
          onChange: (event) => update({ buttonColor: event.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        className: block.props.open ? "is-active" : "",
        onMouseDown: keepSelection,
        onClick: () => update({ open: !block.props.open }),
        children: block.props.open ? "Starts open" : "Starts closed"
      }
    )
  ] });
}
var cardSpec = createReactBlockSpec(
  {
    type: "card",
    propSchema: {
      url: { default: "" },
      buttonColor: { default: CARD_BUTTON_COLOR },
      open: { default: false }
    },
    content: "inline"
  },
  {
    render: ({ block, editor, contentRef }) => {
      const color = buttonColorOf(block);
      return /* @__PURE__ */ jsxs4("div", { className: "bnk-card", children: [
        /* @__PURE__ */ jsxs4("div", { className: `bnk-card-head${block.props.url ? " has-image" : ""}`, children: [
          block.props.url && /* @__PURE__ */ jsx5(
            "img",
            {
              className: "bnk-card-image",
              src: block.props.url,
              alt: "",
              draggable: false,
              contentEditable: false
            }
          ),
          /* @__PURE__ */ jsx5("div", { className: "bnk-card-title", ref: contentRef }),
          /* @__PURE__ */ jsx5(
            "span",
            {
              className: "bnk-card-toggle",
              contentEditable: false,
              style: { backgroundColor: color, color: isDark(color) ? "#ffffff" : "#111827" },
              children: "Show \u2192"
            }
          )
        ] }),
        editor.isEditable && /* @__PURE__ */ jsx5(CardControls, { block, editor }),
        editor.isEditable && /* @__PURE__ */ jsx5("p", { className: "bnk-card-hint", contentEditable: false, children: "To put content inside, press Enter at the end of the title, then Tab. Everything indented under this card opens when the reader presses Show." })
      ] });
    }
  }
);
function cardSlashMenuItem(editor) {
  return {
    title: "Card",
    subtext: "A banner that opens to show more",
    aliases: ["card", "accordion", "toggle", "collapse", "show", "hide", "faq", "fold"],
    group: "Basic blocks",
    icon: /* @__PURE__ */ jsxs4("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx5("rect", { x: "1.5", y: "2.5", width: "15", height: "6", rx: "1.5", stroke: "currentColor", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx5("path", { d: "M4 12h10M4 15h7", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
    ] }),
    onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "card" })
  };
}

// src/blocks/spacer.jsx
import React6 from "react";
import { insertOrUpdateBlockForSlashMenu as insertOrUpdateBlockForSlashMenu2 } from "@blocknote/core";
import { createReactBlockSpec as createReactBlockSpec2 } from "@blocknote/react";
import { jsx as jsx6 } from "react/jsx-runtime";
var SPACER_SIZES = { sm: "1rem", md: "2.5rem", lg: "5rem", xl: "8rem" };
var spacerSpec = createReactBlockSpec2(
  {
    type: "spacer",
    propSchema: {
      size: { default: "md", values: Object.keys(SPACER_SIZES) }
    },
    content: "none"
  },
  {
    render: ({ block, editor }) => /* @__PURE__ */ jsx6(
      "div",
      {
        className: "bnk-spacer",
        style: { height: SPACER_SIZES[block.props.size] ?? SPACER_SIZES.md },
        children: /* @__PURE__ */ jsx6("div", { className: "bnk-spacer-controls", contentEditable: false, children: Object.keys(SPACER_SIZES).map((size) => /* @__PURE__ */ jsx6(
          "button",
          {
            type: "button",
            className: size === block.props.size ? "is-active" : "",
            onClick: () => editor.updateBlock(block, { props: { size } }),
            children: size.toUpperCase()
          },
          size
        )) })
      }
    )
  }
);
function spacerSlashMenuItem(editor) {
  return {
    title: "Spacer",
    subtext: "Adjustable empty vertical space",
    aliases: ["spacer", "space", "gap", "padding", "margin"],
    group: "Basic blocks",
    icon: /* @__PURE__ */ jsx6("span", { style: { fontSize: "14px" }, children: "\u2195" }),
    onItemClick: () => insertOrUpdateBlockForSlashMenu2(editor, { type: "spacer" })
  };
}

// src/columns.jsx
import React7 from "react";
import { insertColumnList, locales as multiColumnLocales } from "@blocknote/xl-multi-column";
import { jsx as jsx7 } from "react/jsx-runtime";
var COLUMN_MENU_ENTRIES = { two_columns: 2, three_columns: 3 };
function ColumnsIcon({ count }) {
  const gap = 2;
  const width = (17 - gap * (count - 1)) / count;
  return /* @__PURE__ */ jsx7("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", "aria-hidden": "true", children: Array.from({ length: count }, (_, index) => /* @__PURE__ */ jsx7(
    "rect",
    {
      x: 0.5 + index * (width + gap),
      y: "2.5",
      width,
      height: "13",
      rx: "1.5",
      stroke: "currentColor",
      strokeWidth: "1.5"
    },
    index
  )) });
}
function columnSlashMenuItems(editor) {
  return Object.entries(COLUMN_MENU_ENTRIES).map(([entry, count]) => ({
    ...multiColumnLocales.en.slash_menu[entry],
    icon: /* @__PURE__ */ jsx7(ColumnsIcon, { count }),
    onItemClick: () => insertColumnList(editor, count)
  }));
}

// src/schema.jsx
function createKitSchema({ fonts = [] } = {}) {
  return withMultiColumn(BlockNoteSchema.create({
    blockSpecs: withItemProps(withVideoEmbeds({
      ...defaultBlockSpecs,
      spacer: spacerSpec(),
      card: cardSpec()
    })),
    styleSpecs: {
      ...defaultStyleSpecs,
      fontFamily: fontFamilyStyleSpec(fonts)
    }
  })).extend({
    blockSpecs: {
      columnList: columnListWithItemProps()
    }
  });
}
function kitEditorOptions() {
  return {
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...coreEn,
      multi_column: multiColumnLocales2.en
    }
  };
}
function kitSlashMenuItems(editor) {
  return combineByGroup(
    getDefaultReactSlashMenuItems(editor),
    columnSlashMenuItems(editor),
    [spacerSlashMenuItem(editor), cardSlashMenuItem(editor)]
  );
}

// src/BlockEditor.jsx
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
function BlockEditor({
  initialContent,
  onChange,
  editable = true,
  fonts = [],
  uploadFile,
  media,
  appearance,
  surface = true,
  trackInsertTargets = false,
  onEditorReady,
  className = ""
}) {
  const hostRef = useRef3(null);
  const startingContent = useMemo(() => normalizeDocument(initialContent), []);
  const editor = useCreateBlockNote({
    schema: createKitSchema({ fonts }),
    ...kitEditorOptions(),
    initialContent: startingContent,
    uploadFile
  });
  useEffect3(() => {
    if (trackInsertTargets && hostRef.current) {
      trackTextTargets();
      registerEditor(hostRef.current, editor);
    }
  }, [editor, trackInsertTargets]);
  useEffect3(() => {
    onEditorReady?.(editor);
  }, [editor]);
  const look = surface ? appearanceToSurface(appearance) : null;
  const usesLibrary = editable && media !== void 0 && media !== null;
  const view = /* @__PURE__ */ jsxs5(
    BlockNoteView,
    {
      editor,
      editable,
      theme: "light",
      slashMenu: false,
      sideMenu: false,
      filePanel: false,
      formattingToolbar: false,
      onChange: () => onChange?.(editor.document),
      children: [
        usesLibrary ? /* @__PURE__ */ jsx8(MediaFilePanelController, {}) : /* @__PURE__ */ jsx8(FilePanelController2, {}),
        /* @__PURE__ */ jsx8(
          FormattingToolbarController,
          {
            formattingToolbar: (props) => /* @__PURE__ */ jsx8(MediaFormattingToolbar, { ...props, fonts, useLibrary: usesLibrary })
          }
        ),
        /* @__PURE__ */ jsx8(
          SideMenuController,
          {
            sideMenu: (props) => /* @__PURE__ */ jsxs5(SideMenu, { ...props, children: [
              /* @__PURE__ */ jsx8(AddBlockButton, { ...props }),
              /* @__PURE__ */ jsx8(DragHandleButton, { ...props, dragHandleMenu: SpacingDragHandleMenu })
            ] })
          }
        ),
        /* @__PURE__ */ jsx8(
          SuggestionMenuController,
          {
            triggerCharacter: "/",
            getItems: async (query) => filterSuggestionItems(kitSlashMenuItems(editor), query)
          }
        ),
        /* @__PURE__ */ jsx8(BlockItemControls, { editor, editable })
      ]
    }
  );
  const dialog = usesLibrary ? /* @__PURE__ */ jsx8(MediaLibraryDialog, { editor, media }) : null;
  if (!surface) {
    return /* @__PURE__ */ jsxs5("div", { ref: hostRef, "data-bnk-editor": "", children: [
      dialog,
      view
    ] });
  }
  return /* @__PURE__ */ jsxs5(
    "div",
    {
      ref: hostRef,
      "data-bnk-editor": "",
      className: ["bnk-blocknote", look.className, className].filter(Boolean).join(" "),
      style: look.style,
      children: [
        dialog,
        view,
        look.video && /* @__PURE__ */ jsx8("div", { className: "bnk-blocknote-media", "aria-hidden": "true", children: look.video.embed ? /* @__PURE__ */ jsx8("iframe", { src: look.video.url, title: "Background video", allow: "autoplay; encrypted-media", tabIndex: -1 }) : /* @__PURE__ */ jsx8("video", { src: look.video.url, autoPlay: true, muted: true, loop: true, playsInline: true }) })
      ]
    }
  );
}

// src/mount.jsx
import React9 from "react";
import { createRoot } from "react-dom/client";
import { jsx as jsx9 } from "react/jsx-runtime";
function mountBlockEditor(element, props = {}) {
  if (element.__bnkHandle) {
    return element.__bnkHandle;
  }
  const root = createRoot(element);
  let current = props;
  const render = () => root.render(/* @__PURE__ */ jsx9(BlockEditor, { ...current }));
  const handle = {
    update(next) {
      current = { ...current, ...next };
      render();
    },
    unmount() {
      root.unmount();
      delete element.__bnkHandle;
    }
  };
  element.__bnkHandle = handle;
  render();
  return handle;
}
export {
  BLEED_STEPS,
  BlockEditor,
  BlockItemControls,
  CARD_BUTTON_COLOR,
  CONTENT_WIDTHS,
  ColumnsIcon,
  DEFAULT_APPEARANCE,
  DEFAULT_TINT_COLOR,
  FLUID_SPACING,
  FONT_FAMILY_STYLE,
  FontFamilySelect,
  ITEM_SPACING,
  MAX_BLUR,
  MediaFilePanelController,
  MediaFormattingToolbar,
  MediaLibraryDialog,
  POSITIONS,
  SPACER_SIZES,
  SPACING,
  SPACING_PROP_SCHEMA,
  SpacingDragHandleMenu,
  WIDTH_COLUMNS,
  appearanceToSurface,
  backgroundVideoEmbedUrl,
  cardSlashMenuItem,
  cardSpec,
  columnListWithItemProps,
  columnSlashMenuItems,
  createKitSchema,
  fontFamilyStyleSpec,
  hexColor,
  insertText,
  isDarkColor,
  kitEditorOptions,
  kitSlashMenuItems,
  mountBlockEditor,
  normalizeDocument,
  registerEditor,
  resolveBackgroundType,
  spacerSlashMenuItem,
  spacerSpec,
  trackTextTargets,
  videoEmbedUrl,
  withItemProps,
  withVideoEmbeds
};
