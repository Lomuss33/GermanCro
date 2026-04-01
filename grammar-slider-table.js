import { layoutWithLines, prepareWithSegments } from "./vendor/pretext/dist/layout.js";

const MOBILE_BREAKPOINT = 720;
const HOVER_QUERY =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : null;

const CELL_PADDING_X = 8;
const HEADER_PADDING_X = 7;
const ROW_HEADER_PADDING_X = 7;

const preparedCache = new Map();
const lineLayoutCache = new Map();

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPrepared(text, font) {
  const cacheKey = `${font}\n${text}`;
  if (!preparedCache.has(cacheKey)) {
    preparedCache.set(cacheKey, prepareWithSegments(String(text ?? ""), font));
  }
  return preparedCache.get(cacheKey);
}

function getLineLayout(text, font, maxWidth, lineHeight) {
  const safeWidth = Math.max(1, Math.round(maxWidth * 100) / 100);
  const cacheKey = `${font}\n${lineHeight}\n${safeWidth}\n${text}`;
  if (!lineLayoutCache.has(cacheKey)) {
    lineLayoutCache.set(
      cacheKey,
      layoutWithLines(getPrepared(String(text ?? ""), font), safeWidth, lineHeight)
    );
  }
  return lineLayoutCache.get(cacheKey);
}

function buildFontShorthand(fontWeight, fontSize, fontFamily) {
  return `normal ${fontWeight} ${fontSize}px ${fontFamily}`;
}

function getFontFamily(root, variableName, fallback) {
  const styles = getComputedStyle(root);
  const value = styles.getPropertyValue(variableName).trim();
  return value || fallback;
}

function getTypography(root) {
  const displayFamily = getFontFamily(root, "--font-display", "Tahoma, sans-serif");
  const bodyFamily = getFontFamily(root, "--font-body", '"Segoe UI", "Trebuchet MS", sans-serif');

  return {
    header: {
      fontSize: 9,
      fontWeight: 700,
      lineHeight: 12,
      fontFamily: displayFamily,
      font: buildFontShorthand(700, 9, displayFamily),
    },
    rowHeader: {
      fontSize: 10.5,
      fontWeight: 700,
      lineHeight: 14,
      fontFamily: displayFamily,
      font: buildFontShorthand(700, 10.5, displayFamily),
    },
    cell: {
      fontSize: 11,
      fontWeight: 400,
      lineHeight: 14,
      fontFamily: bodyFamily,
      font: buildFontShorthand(400, 11, bodyFamily),
    },
  };
}

function buildGroupStarts(totalDataColumns, visibleDataColumns) {
  if (totalDataColumns <= visibleDataColumns) {
    return [0];
  }

  const starts = [];
  for (let start = 0; start + visibleDataColumns < totalDataColumns; start += visibleDataColumns) {
    starts.push(start);
  }

  const lastStart = Math.max(0, totalDataColumns - visibleDataColumns);
  if (!starts.length || starts[starts.length - 1] !== lastStart) {
    starts.push(lastStart);
  }

  return starts;
}

function buildGroups(columns, visibleDataColumns) {
  const starts = buildGroupStarts(columns.length, visibleDataColumns);
  return starts.map((start, index) => ({
    index,
    start,
    end: Math.min(columns.length, start + visibleDataColumns),
    columns: columns.slice(start, start + visibleDataColumns),
  }));
}

function measureTextBlock(text, typography, width, paddingX) {
  const layout = getLineLayout(text, typography.font, width - paddingX * 2, typography.lineHeight);
  const lineCount = layout.lineCount || 1;

  return {
    layout,
    height: lineCount * typography.lineHeight,
  };
}

function createCellLineElements(text, layout, typography) {
  const fragment = document.createDocumentFragment();
  const lines = layout.lines?.length ? layout.lines : [{ text: String(text ?? "") }];

  lines.forEach((line) => {
    const span = document.createElement("span");
    span.className = "grammar-slider-line";
    span.textContent = line.text;
    span.style.fontFamily = typography.fontFamily;
    span.style.fontSize = `${typography.fontSize}px`;
    span.style.fontWeight = String(typography.fontWeight);
    span.style.lineHeight = `${typography.lineHeight}px`;
    fragment.appendChild(span);
  });

  return fragment;
}

function createCellElement({ className, role, text, layout, typography, height }) {
  const element = document.createElement("div");
  element.className = className;
  if (role) {
    element.setAttribute("role", role);
  }
  element.style.height = `${height}px`;

  const inner = document.createElement("div");
  inner.className = "grammar-slider-cell-inner";
  inner.style.fontFamily = typography.fontFamily;
  inner.style.fontSize = `${typography.fontSize}px`;
  inner.style.fontWeight = String(typography.fontWeight);
  inner.style.lineHeight = `${typography.lineHeight}px`;
  inner.appendChild(createCellLineElements(text, layout, typography));
  element.appendChild(inner);

  return element;
}

function getVisibleDataColumns(interaction, totalDataColumns, isMobile, availableWidth) {
  if (isMobile) {
    return Math.max(1, Math.min(totalDataColumns, interaction.mobileVisibleDataColumns || 1));
  }

  const adaptive = interaction.desktopVisibleDataColumnsAdaptive;
  if (adaptive) {
    const minColumns = clamp(interaction.desktopVisibleDataColumnsMin || 2, 1, totalDataColumns);
    const maxColumns = clamp(
      interaction.desktopVisibleDataColumnsMax || totalDataColumns,
      minColumns,
      totalDataColumns
    );
    const minColumnWidth = Math.max(56, interaction.desktopMinColumnWidth || 84);

    for (let columns = maxColumns; columns >= minColumns; columns -= 1) {
      if (availableWidth / columns >= minColumnWidth) {
        return columns;
      }
    }

    return minColumns;
  }

  return Math.max(1, Math.min(totalDataColumns, interaction.desktopVisibleDataColumns || 1));
}

function getLayoutMode(root) {
  const width = root.clientWidth || root.getBoundingClientRect().width || 0;
  const viewportWidth =
    typeof window !== "undefined"
      ? window.innerWidth || document.documentElement?.clientWidth || width
      : width;
  return {
    width,
    isMobile: viewportWidth <= MOBILE_BREAKPOINT,
    canHover: Boolean(HOVER_QUERY?.matches),
  };
}

function createHoverZones({ isMobile, activeGroupIndex, setActiveGroupIndex, maxGroupIndex }) {
  const zones = document.createElement("div");
  zones.className = `grammar-slider-hover-zones grammar-slider-hover-overlay${isMobile ? " is-mobile" : " is-desktop"}`;

  const hasPrev = activeGroupIndex > 0;
  const hasNext = activeGroupIndex < maxGroupIndex;

  const prevZone = document.createElement("div");
  prevZone.className = `grammar-slider-hover-zone is-left${hasPrev ? "" : " is-disabled"}`;
  if (hasPrev) {
    prevZone.addEventListener("mouseenter", () => setActiveGroupIndex(activeGroupIndex - 1));
    prevZone.addEventListener("click", () => setActiveGroupIndex(activeGroupIndex - 1));
  }

  const centerZone = document.createElement("div");
  centerZone.className = "grammar-slider-hover-zone is-center";

  const nextZone = document.createElement("div");
  nextZone.className = `grammar-slider-hover-zone is-right${hasNext ? "" : " is-disabled"}`;
  if (hasNext) {
    nextZone.addEventListener("mouseenter", () => setActiveGroupIndex(activeGroupIndex + 1));
    nextZone.addEventListener("click", () => setActiveGroupIndex(activeGroupIndex + 1));
  }

  zones.append(prevZone, centerZone, nextZone);
  return zones;
}

export function measureGrammarSliderTable({ root, card }) {
  const interaction = card.interaction || {};
  const { width: rootWidth, isMobile, canHover } = getLayoutMode(root);
  const typography = getTypography(root);
  const columns = Array.isArray(card.columns) ? card.columns.map(String) : [];
  const rows = Array.isArray(card.rows) ? card.rows.map((row) => row.map((cell) => String(cell ?? ""))) : [];
  const fixedColumns = Math.max(1, interaction.fixedColumns || 1);
  const fixedHeaderLabel = columns[0] || "";
  const dataColumns = columns.slice(fixedColumns);
  const fixedMinWidth = isMobile ? 78 : 92;
  const fixedMaxWidth = isMobile ? 112 : 136;
  const targetFixedWidth = rootWidth * (isMobile ? 0.29 : 0.24);
  let fixedColumnWidth = clamp(targetFixedWidth, fixedMinWidth, fixedMaxWidth);
  let dataViewportWidth = Math.max(140, rootWidth - fixedColumnWidth);
  const visibleDataColumns = getVisibleDataColumns(
    interaction,
    dataColumns.length,
    isMobile,
    dataViewportWidth
  );
  const groups = buildGroups(dataColumns, visibleDataColumns);

  const minimumDataColumnWidth = isMobile ? 76 : 84;
  const minimumViewportWidth = Math.max(150, visibleDataColumns * minimumDataColumnWidth);
  if (rootWidth - fixedColumnWidth < minimumViewportWidth) {
    fixedColumnWidth = Math.max(72, rootWidth - minimumViewportWidth);
  }

  dataViewportWidth = Math.max(140, rootWidth - fixedColumnWidth);
  const dataColumnWidth = dataViewportWidth / visibleDataColumns;

  const fixedHeader = measureTextBlock(
    fixedHeaderLabel,
    typography.header,
    fixedColumnWidth,
    HEADER_PADDING_X
  );

  const dataHeaderLayouts = dataColumns.map((label) =>
    measureTextBlock(label, typography.header, dataColumnWidth, HEADER_PADDING_X)
  );

  const fixedRowLayouts = rows.map((row) =>
    measureTextBlock(row[0] || "", typography.rowHeader, fixedColumnWidth, ROW_HEADER_PADDING_X)
  );

  const dataRowLayouts = rows.map((row) =>
    row.slice(fixedColumns).map((cell) =>
      measureTextBlock(cell, typography.cell, dataColumnWidth, CELL_PADDING_X)
    )
  );

  const headerHeight = Math.max(
    fixedHeader.height,
    ...dataHeaderLayouts.map((item) => item.height),
    typography.header.lineHeight
  );

  const rowHeights = rows.map((_, rowIndex) => {
    const fixedHeight = fixedRowLayouts[rowIndex]?.height || typography.rowHeader.lineHeight;
    const dataHeights = dataRowLayouts[rowIndex]?.map((item) => item.height) || [];
    return Math.max(fixedHeight, ...dataHeights, typography.cell.lineHeight);
  });

  return {
    card,
    rows,
    fixedHeaderLabel,
    dataColumns,
    groups,
    isMobile,
    canHoverDesktop: !isMobile && canHover && groups.length > 1,
    fixedColumnWidth,
    dataViewportWidth,
    dataColumnWidth,
    typography,
    fixedHeader,
    dataHeaderLayouts,
    fixedRowLayouts,
    dataRowLayouts,
    headerHeight,
    rowHeights,
  };
}

export function renderGrammarSliderTable({
  root,
  measurement,
  activeGroupIndex,
  setActiveGroupIndex,
}) {
  const mobileTrackWidth = measurement.groups.length * measurement.dataViewportWidth;
  const mobileTranslateX =
    measurement.groups.length <= 1
      ? 0
      : -(activeGroupIndex * measurement.dataViewportWidth);
  const desktopTrackWidth = measurement.dataColumns.length * measurement.dataColumnWidth;
  const desktopTranslateX =
    measurement.isMobile || measurement.groups.length <= 1 || activeGroupIndex === 0
      ? 0
      : -Math.max(0, desktopTrackWidth - measurement.dataViewportWidth);

  const shell = document.createElement("div");
  shell.className = `grammar-slider-shell${measurement.isMobile ? " is-mobile" : " is-desktop"}`;
  shell.style.setProperty("--grammar-fixed-width", `${measurement.fixedColumnWidth}px`);
  shell.style.setProperty("--grammar-data-viewport-width", `${measurement.dataViewportWidth}px`);
  shell.style.setProperty("--grammar-data-column-width", `${measurement.dataColumnWidth}px`);

  const table = document.createElement("div");
  table.className = "grammar-slider-table";
  table.setAttribute("role", "table");
  table.setAttribute("aria-label", measurement.card.title);

  const createRowViewport = ({ rowIndex = null, height, isHeader }) => {
    const viewport = document.createElement("div");
    viewport.className = `grammar-slider-row-viewport ${isHeader ? "grammar-slider-header-viewport" : "grammar-slider-body-viewport"}`;
    viewport.style.height = `${height}px`;

    const track = document.createElement("div");
    track.className = "grammar-slider-track";

    if (measurement.isMobile) {
      track.classList.add("is-horizontal");
      track.style.width = `${mobileTrackWidth}px`;
      track.style.transform = `translate3d(${mobileTranslateX}px, 0, 0)`;

      measurement.groups.forEach((group) => {
        const page = document.createElement("div");
        page.className = `grammar-slider-page ${isHeader ? "grammar-slider-header-page" : "grammar-slider-body-page"}`;
        page.style.width = `${measurement.dataViewportWidth}px`;
        page.style.minWidth = `${measurement.dataViewportWidth}px`;
        page.style.height = `${height}px`;
        page.style.gridTemplateColumns = `repeat(${group.columns.length}, minmax(0, 1fr))`;

        group.columns.forEach((label, columnOffset) => {
          const absoluteIndex = group.start + columnOffset;
          const layout = isHeader
            ? measurement.dataHeaderLayouts[absoluteIndex].layout
            : measurement.dataRowLayouts[rowIndex][absoluteIndex].layout;
          const text = isHeader
            ? label
            : measurement.rows[rowIndex][absoluteIndex + 1] || "";
          const cell = createCellElement({
            className: isHeader
              ? "grammar-slider-header-cell grammar-slider-data-header-cell"
              : "grammar-slider-data-cell",
            role: isHeader ? "columnheader" : "cell",
            text,
            layout,
            typography: isHeader ? measurement.typography.header : measurement.typography.cell,
            height,
          });
          page.appendChild(cell);
        });

        track.appendChild(page);
      });
    } else {
      track.classList.add("is-horizontal", "is-seamless");
      track.style.width = `${desktopTrackWidth}px`;
      track.style.transform = `translate3d(${desktopTranslateX}px, 0, 0)`;

      const page = document.createElement("div");
      page.className = `grammar-slider-page ${isHeader ? "grammar-slider-header-page" : "grammar-slider-body-page"} is-seamless`;
      page.style.width = `${desktopTrackWidth}px`;
      page.style.minWidth = `${desktopTrackWidth}px`;
      page.style.height = `${height}px`;
      page.style.gridTemplateColumns = `repeat(${measurement.dataColumns.length}, minmax(0, 1fr))`;

      measurement.dataColumns.forEach((label, absoluteIndex) => {
        const layout = isHeader
          ? measurement.dataHeaderLayouts[absoluteIndex].layout
          : measurement.dataRowLayouts[rowIndex][absoluteIndex].layout;
        const text = isHeader
          ? label
          : measurement.rows[rowIndex][absoluteIndex + 1] || "";
        const cell = createCellElement({
          className: isHeader
            ? "grammar-slider-header-cell grammar-slider-data-header-cell"
            : "grammar-slider-data-cell",
          role: isHeader ? "columnheader" : "cell",
          text,
          layout,
          typography: isHeader ? measurement.typography.header : measurement.typography.cell,
          height,
        });
        page.appendChild(cell);
      });

      track.appendChild(page);
    }

    viewport.appendChild(track);
    return viewport;
  };

  const headerRow = document.createElement("div");
  headerRow.className = "grammar-slider-table-row grammar-slider-table-row--header";
  headerRow.setAttribute("role", "row");
  headerRow.appendChild(
    createCellElement({
      className: "grammar-slider-sticky-cell grammar-slider-fixed-head grammar-slider-header-cell",
      role: "columnheader",
      text: measurement.fixedHeaderLabel,
      layout: measurement.fixedHeader.layout,
      typography: measurement.typography.header,
      height: measurement.headerHeight,
    })
  );
  headerRow.appendChild(createRowViewport({ height: measurement.headerHeight, isHeader: true }));
  table.appendChild(headerRow);

  measurement.rows.forEach((row, rowIndex) => {
    const tableRow = document.createElement("div");
    tableRow.className = "grammar-slider-table-row grammar-slider-table-row--body";
    tableRow.setAttribute("role", "row");
    tableRow.appendChild(
      createCellElement({
        className: "grammar-slider-sticky-cell grammar-slider-rowheader-cell",
        role: "rowheader",
        text: row[0] || "",
        layout: measurement.fixedRowLayouts[rowIndex].layout,
        typography: measurement.typography.rowHeader,
        height: measurement.rowHeights[rowIndex],
      })
    );
    tableRow.appendChild(
      createRowViewport({
        rowIndex,
        height: measurement.rowHeights[rowIndex],
        isHeader: false,
      })
    );
    table.appendChild(tableRow);
  });

  if (measurement.groups.length > 1) {
    table.appendChild(createHoverZones({
      isMobile: measurement.isMobile,
      activeGroupIndex,
      setActiveGroupIndex,
      maxGroupIndex: measurement.groups.length - 1,
    }));
  }

  shell.appendChild(table);

  if (measurement.isMobile && measurement.groups.length > 1) {
    let touchStartX = null;
    let touchStartY = null;

    table.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? null;
      touchStartY = event.changedTouches[0]?.clientY ?? null;
    }, { passive: true });

    table.addEventListener("touchend", (event) => {
      const touchEndX = event.changedTouches[0]?.clientX ?? null;
      const touchEndY = event.changedTouches[0]?.clientY ?? null;
      if (touchStartX === null || touchStartY === null || touchEndX === null || touchEndY === null) {
        touchStartX = null;
        touchStartY = null;
        return;
      }

      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;
      touchStartX = null;
      touchStartY = null;

      if (Math.abs(deltaX) < 24 || Math.abs(deltaX) <= Math.abs(deltaY)) {
        return;
      }

      if (deltaX > 0) {
        setActiveGroupIndex(activeGroupIndex + 1);
        return;
      }

      setActiveGroupIndex(activeGroupIndex - 1);
    }, { passive: true });
  }

  root.replaceChildren(shell);
}

export function createGrammarSliderTable(config) {
  const { root, card } = config;
  if (!root || !card) {
    return null;
  }

  const state = {
    activeGroupIndex: 0,
    frameId: 0,
    layoutMode: null,
  };

  const render = () => {
    state.frameId = 0;
    const measurement = measureGrammarSliderTable({ root, card });
    const maxGroupIndex = Math.max(0, measurement.groups.length - 1);
    const nextLayoutMode = measurement.isMobile ? "mobile" : "desktop";

    if (state.layoutMode !== nextLayoutMode) {
      state.layoutMode = nextLayoutMode;
      if (nextLayoutMode === "desktop") {
        state.activeGroupIndex = 0;
      }
    }

    state.activeGroupIndex = clamp(state.activeGroupIndex, 0, maxGroupIndex);

    renderGrammarSliderTable({
      root,
      measurement,
      activeGroupIndex: state.activeGroupIndex,
      setActiveGroupIndex(nextGroupIndex) {
        const next = clamp(nextGroupIndex, 0, maxGroupIndex);
        if (next === state.activeGroupIndex) {
          return;
        }
        state.activeGroupIndex = next;
        render();
      },
    });
  };

  const scheduleRender = () => {
    if (state.frameId) {
      cancelAnimationFrame(state.frameId);
    }
    state.frameId = requestAnimationFrame(render);
  };

  const resizeObserver =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(() => scheduleRender())
      : null;

  resizeObserver?.observe(root);
  render();

  return {
    destroy() {
      if (state.frameId) {
        cancelAnimationFrame(state.frameId);
      }
      resizeObserver?.disconnect();
      root.replaceChildren();
    },
    rerender() {
      render();
    },
  };
}
