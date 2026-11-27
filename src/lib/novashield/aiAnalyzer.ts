export type AiSeverity = "高" | "中" | "低";

export interface AiFeedbackAnalysis {
  category: string;
  severity: AiSeverity;
  lineReply: string;
  internalAdvice: string[];
}

export interface AiAnalyzeApiResponse {
  ok: boolean;
  mode: "openai" | "mock";
  result?: AiFeedbackAnalysis;
  error?: string;
}

export const AI_ANALYZE_SYSTEM_PROMPT =
  "你是一位資深的餐飲與零售門市營運專家及客訴處理大師。請分析以下顧客的負評文字，並回傳 JSON 格式結果，包含：category (問題類型), severity (嚴重度: 高/中/低), lineReply (適合 LINE 傳給客人的溫暖誠懇回覆), internalAdvice (門市內部改善建議陣列)。";

export function normalizeAiAnalysis(
  raw: Record<string, unknown>,
  fallback: AiFeedbackAnalysis,
): AiFeedbackAnalysis {
  const category =
    typeof raw.category === "string" && raw.category.trim()
      ? raw.category.trim().slice(0, 24)
      : fallback.category;

  const rawSev = typeof raw.severity === "string" ? raw.severity.trim() : "";
  let severity: AiSeverity = fallback.severity;
  if (rawSev.includes("高")) severity = "高";
  else if (rawSev.includes("中")) severity = "中";
  else if (rawSev.includes("低") || rawSev.includes("輕")) severity = "低";

  const lineReply =
    typeof raw.lineReply === "string" && raw.lineReply.trim()
      ? raw.lineReply.trim().slice(0, 800)
      : fallback.lineReply;

  const internalAdvice = Array.isArray(raw.internalAdvice)
    ? raw.internalAdvice
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 4)
    : fallback.internalAdvice;

  return {
    category,
    severity,
    lineReply,
    internalAdvice:
      internalAdvice.length >= 2 ? internalAdvice : fallback.internalAdvice,
  };
}

/**
 * Deterministic, domain-tuned Traditional Chinese analyzer used when
 * OPENAI_API_KEY is unset or unavailable so the admin UI always works reliably.
 */
export function generateSmartMockAnalysis(
  feedbackText: string,
  shopName?: string,
): AiFeedbackAnalysis {
  const text = feedbackText.trim();
  const store = shopName?.trim() || "本門市";

  const hasHygiene =
    /髒|黏|頭髮|蟑螂|蟲|異味|臭|衛生|不乾淨|油膩|廁所|桌面/.test(text);
  const hasAttitude =
    /態度|跩|口氣|臉色|不耐煩|兇|冷漠|沒禮貌|翻白眼|推託|服務生|店員/.test(text);
  const hasSpeed =
    /等很久|很久|太久|慢|漏單|催|超過|分鐘|拖|出餐/.test(text);
  const hasFood =
    /冷掉|冷的|難吃|太鹹|太油|焦|不新鮮|份量|口味|沒熟|餐點|湯|咖啡/.test(text);
  const hasBilling = /算錯|多收|發票|價格|太貴|結帳|找錯錢|刷卡/.test(text);

  if (hasHygiene) {
    return {
      category: "環境衛生",
      severity: "高",
      lineReply: `您好，我是${store}的店長，非常抱歉這次用餐環境讓您感到不適！衛生與整潔是我們最重視的底線，我已立即請現場夥伴全面重新清潔並檢視消毒流程。誠摯希望能有機會補償您這次不愉快的體驗，若您方便，請直接回覆我您的聯絡方式或下次光臨時間，我將親自為您招待並確認座位環境，再次向您致上十二萬分歉意。`,
      internalAdvice: [
        "立即對客訴提及區域執行深層清潔與消毒，並拍照記錄於店長交接日誌。",
        "建立每 2 小時定時巡檢表（桌面擦拭、異味檢查、洗手間與出餐口清潔），由當班幹部簽核。",
        "於班前會重申清桌 SOP（先噴食品級酒精靜置 10 秒再雙面擦拭），避免尖峰期草率收桌。",
      ],
    };
  }

  if (hasAttitude) {
    return {
      category: "服務態度",
      severity: "高",
      lineReply: `您好，我是${store}的店長，看到您反映今天現場接待的態度問題，我感到非常抱歉與自責！無論現場多忙碌，讓您感受到不被尊重都是我們教育訓練的疏失。我已立刻與當班夥伴進行檢討與輔導，也非常感謝您願意私下告訴我們。下次若願意再給我們一次服務的機會，請務必透過 LINE 告知我，我將親自接待並為您準備專屬致意小禮。`,
      internalAdvice: [
        "店長於 24 小時內一對一與當班人員還原情境，釐清是忙碌壓力或溝通話術問題，避免公開責罵但明確要求改善標準。",
        "制定尖峰時段「3 秒微笑點頭＋主動告知等候時間」標準話術，減少顧客被冷落或口氣生硬的感受。",
        "於一週內安排神秘客或資深幹部隨行觀察外場互動，確保服務品質回穩。",
      ],
    };
  }

  if (hasSpeed && hasFood) {
    return {
      category: "出餐速度",
      severity: "高",
      lineReply: `您好，我是${store}的店長，非常抱歉讓您久等、還拿到溫度不佳的餐點！這完全不符合我們對出餐品質的要求。我已經立刻向內外場確認今天的出餐銜接狀況，誠心希望為您補上一份現做熱騰騰的餐點或提供下次招待券作為致意。若您現在還在店內或方便回覆，請讓我知道如何補償您最合適，謝謝您給我們改進的機會！`,
      internalAdvice: [
        "檢視內場出餐台保溫設備與外場送餐銜接時間，設定餐點完成超過 2 分鐘即由值班主管主動支援送餐。",
        "尖峰候餐超過 15 分鐘時，外場須主動致意並提供茶水或小點緩衝情緒，避免雙重不滿疊加。",
        "重新盤點 POS 單據排序與備料動線，針對高耗時品項增設預備工序或於點餐時先行告知預計出餐時間。",
      ],
    };
  }

  if (hasSpeed) {
    return {
      category: "出餐速度",
      severity: "中",
      lineReply: `您好，我是${store}的店長，非常抱歉今日讓您久候了！尖峰時段沒能掌握好出餐節奏並提前告知您等候時間，是我們的疏失。我們已立刻檢討廚房與外場的出餐排程，感謝您願意直接反映給我們知道。希望能致贈您一張飲品／小點招待券表達歉意，期待下次能帶給您更流暢愉快的體驗！`,
      internalAdvice: [
        "建立候餐預警門檻（單筆點單超過 12 分鐘亮燈提醒），由外場主動向顧客更新進度。",
        "盤點熱門時段人力排班與內場瓶頸站點，視情況調整預備料比例以縮短出餐時間。",
      ],
    };
  }

  if (hasFood) {
    return {
      category: "餐點品質",
      severity: /沒熟|不新鮮|異物|拉肚子/.test(text) ? "高" : "中",
      lineReply: `您好，我是${store}的店長，非常抱歉今天的餐點沒能達到您的期待！我們非常重視每一道出餐的溫度與風味，已立即請廚房團隊針對該品項重新試吃與核對標準配方。若您願意，誠摯希望能為您補做一份或致贈下次招待券補償，再次感謝您寶貴的提醒！`,
      internalAdvice: [
        "立即針對被反映的品項進行試吃、中心溫度量測與調味比例複核，確認是否為批次食材或製程偏差。",
        "於出餐口增設最後目視與溫度抽檢機制，未達標準品項嚴禁端上桌。",
        "記錄本次品項異常於週會檢討，必要時聯繫供應商確認原料鮮度。",
      ],
    };
  }

  if (hasBilling) {
    return {
      category: "消費與結帳",
      severity: "中",
      lineReply: `您好，我是${store}的店長，非常抱歉在結帳金額或明細核對上造成您的困擾！請您放心，若有任何多收或帳務誤差，我們將立刻為您全額退還差額。請直接傳送您的消費時間或明細給我，我會親自核對並盡快為您處理完畢！`,
      internalAdvice: [
        "立即核對當日 POS 結帳紀錄與發票明細，確認是否為折扣設定錯誤或人員操作疏失。",
        "規範收銀員結帳前口頭複誦品項與總金額，並雙手交付明細讓顧客核對。",
      ],
    };
  }

  return {
    category: "服務體驗",
    severity: "低",
    lineReply: `您好，我是${store}的店長，非常感謝您撥冗透過私訊告訴我們今天的用餐感受！沒能帶給您 100% 滿意的體驗我們深感抱歉，您的每一項建議我都會親自紀錄並在團隊會議中討論改善。期待未來有機會再次為您服務，讓我們用更好的表現回饋您的支持！`,
    internalAdvice: [
      "將本次顧客回饋納入本週門市晨會案例分享，確認現場流程是否有可進一步優化的細節。",
      "於 24 小時內追蹤顧客回覆，若顧客留下聯絡資訊則於改善後主動回訪致意，將負評轉為回頭客。",
    ],
  };
}
