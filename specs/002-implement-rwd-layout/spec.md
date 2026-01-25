# Feature Specification: 實作響應式網頁設計 (RWD Layout)

**Feature Branch**: `002-implement-rwd-layout`  
**Created**: 2026-01-25  
**Status**: Draft  
**Input**: User description: "目前的畫面只適用於桌面模式，想把畫面全部改成同時支援桌面與手機的RWD模式..."

## Clarifications

### Session 2026-01-25

- Q: 手機版字典浮動視窗 (Dictionary Popup) 應採取何種互動模式？ (Bottom Sheet vs Centered Modal) → A: 採用 **置底抽屜 (Bottom Sheet)**，因其在手機上符合單手操作習慣且不遮蔽上方內容，是現代行動網頁的最佳實踐。
- Q: 手機版頂部導覽列 (Volume/Chapter Selectors) 應如何呈現以避免佔用閱讀空間？ (Stacked/Collapsible/Hamburger) → A: 採用 **側邊選單 (Hamburger Menu)**，將導覽選項移入側邊抽屜，保持閱讀畫面最簡潔。
- Q: 跨裝置字體大小策略為何？ → A: 手機版基礎字級 (Body Text) 若低於 16px 則統一提升至 **16px**，標題依比例微調縮小，確保閱讀舒適度。
- Q: 複雜的語言切換設定 (三組下拉選單) 在手機上應置於何處？ → A: **整合至側邊選單 (Inside Hamburger)**，作為次級區塊，避免佔據頂部導覽列。
- Q: 手機上如何避免「選取查字」與系統原生選單衝突？ → A: 採用 **點擊查字 (Tap to Lookup)** 的互動模式，單點即查，長按則保留給系統功能，優化查詢效率。
- Q: 手機版無懸停 (Hover)，如何處理筆記圖示的多語預覽？ → A: 採用 **點擊觸發 (Tap)**。手機上點擊圖示開啟底部抽屜顯示多語翻譯，內含 "Edit Note" 按鈕供編輯；桌面版維持 Hover 預覽、點擊編輯的邏輯。

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 桌面版體驗一致性 (Priority: P1)

桌面版使用者 (>1024px) 在瀏覽網站時，應維持原本靠左上的排版設計，不應有任何視覺或操作上的改變。

**Why this priority**: 確保既有桌面使用者的習慣不受影響是本次改版的前提。

**Independent Test**: 開啟桌面瀏覽器，確認排版維持靠左上，無置中或跑版現象。

**Acceptance Scenarios**:

1. **Given** 使用者使用寬度大於 1024px 的桌面裝置, **When** 進入首頁或閱讀頁面, **Then** 版面靠左上對齊，與改版前一致。
2. **Given** 使用者進行視窗縮放但仍大於 1024px, **When** 觀察內容, **Then** 內容區塊維持固定或流動但不錯位。

---

### User Story 2 - 手機版閱讀體驗 (Priority: P1)

手機版使用者 (<768px) 在瀏覽網站時，應看到適合小螢幕的單欄流式排版，文字清晰可讀，且無水平捲軸。

**Why this priority**: 讓手機使用者能順暢閱讀是本次功能的主要目標。

**Independent Test**: 使用 Chrome DevTools 模擬手機裝置，確認內容完整呈現且無水平捲軸。

**Acceptance Scenarios**:

1. **Given** 使用者使用手機裝置, **When** 進入閱讀頁面, **Then** 文字自動換行，無水平捲軸。
2. **Given** 使用者上下滑動頁面, **When** 快速滑動, **Then** 頁面具有原生的慣性捲動效果 (Momentum Scrolling)。
3. **Given** 頁面包含圖片或大區塊, **When** 顯示於手機上, **Then** 圖片自動縮放至螢幕寬度內。

---

### User Story 3 - 響應式浮動視窗 (Priority: P2)

使用者在手機上使用字典查詢或切換語言時，彈出的視窗應調整為適合觸控的樣式（置底抽屜 Bottom Sheet），避免超出螢幕範圍。

**Why this priority**: 功能性操作（查字典、設定）在手機上若維持桌面浮動視窗設計將難以使用。

**Independent Test**: 在手機模式下點擊字典查詢，確認彈窗樣式改變且易於關閉。

**Acceptance Scenarios**:

1. **Given** 手機模式下, **When** 觸發字典查詢, **Then** 顯示置底抽屜視窗 (Bottom Sheet)，內容完整顯示。
2. **Given** 手機模式下, **When** 開啟多國語言選單, **Then** 選單項目間距加大，易於觸控點擊。
3. **Given** 浮動視窗開啟, **When** 點擊背景或關閉按鈕, **Then** 視窗順暢關閉。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 系統必須實作 CSS Media Queries 以區分桌面 (>1024px) 與手機 (<768px) 斷點。
- **FR-002**: 桌面模式必須強制維持內容容器靠左上對齊 (Left-top alignment)。
- **FR-003**: 手機模式必須將主要內容容器設為寬度 100% 且兩側保留適當 Padding (如 16px)。
- **FR-004**: 手機模式下，所有可點擊元件 (Buttons, Links) 必須符合 44x44px 最小觸控區域標準。
- **FR-005**: 字典浮動視窗 (Dictionary popup) 在手機斷點下必須轉換為置底抽屜 (Bottom Sheet) 樣式。
- **FR-006**: 多國語言切換器 (Language Switcher) 在手機上必須呈現為易於點擊的列表或選單，並整合進 **側邊選單** 內。
- **FR-007**: 頁面滾動容器必須設置 `overscroll-behavior` 與 `-webkit-overflow-scrolling: touch` 以確保原生捲動體驗。
- **FR-008**: 手機模式下必須隱藏或調整不適合小螢幕的裝飾性元素。
- **FR-009**: 手機模式下必須將 Volume/Chapter 選擇器與搜尋欄整合至 **側邊選單 (Hamburger Menu)**，由左上角或右上角圖示觸發。
- **FR-010**: 手機模式下正文 (Body Text) 字體大小不得小於 16px，各級標題 (Headings) 需依響應式比例適度縮放。
- **FR-011**: 手機模式下必須實作 **點擊查字 (Tap to Lookup)** 機制，與系統長按選取 (System Selection) 行為分離。
- **FR-012**: 手機模式下，每句的筆記/翻譯圖示點擊後應開啟 **翻譯抽屜 (Translation Drawer)** 顯示多語內容，並於抽屜內提供「編輯筆記」按鈕。桌面版維持 Hover 預覽、點擊編輯的行為。

### Key Entities

- **UI Layout State**: 負責管理當前斷點狀態 (Desktop/Mobile) 的 CSS 或 Context。
- **FloatingPanel**: 字典與設定的共用浮動視窗元件，需新增 `mode` 屬性支援響應式。

## Success Criteria _(mandatory)_

- **Quantitative**:
  - Google Lighthouse "Mobile Friendly" 項目評分達 90 分以上。
  - 手機版面下，水平捲動 (Horizontal Scroll) 發生率為 0%。
  - 首次內容繪製 (FCP) 在 3G 網速下不超過 2.5 秒。

- **Qualitative**:
  - 用戶在手機上進行 "查單字" -> "關閉" 的操作流暢無阻礙。
  - 桌面版外觀與重構前完全一致 (Pixel Perfect for Layout position)。

## Assumptions

- 平板裝置 (768px - 1024px) 將採用流動式佈局，視覺上偏向桌面版但選單可能折疊。
- 專案已配置 PostCSS 或相容的 CSS 處理工具以支援 Media Queries 嵌套 (Nesting)。
