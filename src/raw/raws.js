const T = [
  'T-in_EN',
  'T-in_CHS',
  'T-1_EN',
  'T-1_CHS',
  'T-2_EN',
  'T-2_CHS',
  'T-3_EN',
  'T-3_CHT',
  'T-4_EN',
  'T-4_CHT',
  'T-5_EN',
  'T-5_CHT',
  'T-6_EN',
  'T-6_CHS',
  'T-7_EN',
  'T-7_CHS',
  'T-8_EN',
  'T-8_CHS',
  'T-9_EN',
  'T-9_CHS',
  'T-10_EN',
  'T-10_CHS',
  'T-11_EN',
  'T-11_CHS',
  'T-12_EN',
  'T-12_CHS',
  'T-13_EN',
  'T-13_CHS',
  'T-14_EN',
  'T-14_CHS',
  'T-15_EN',
  'T-15_CHS',
  'T-16_EN',
  'T-16_CHS',
  'T-17_EN',
  'T-17_CHS',
  'T-18_EN',
  'T-18_CHS',
  'T-19_EN',
  'T-19_CHS',
  'T-20_EN',
  'T-20_CHS',
  'T-21_EN',
  'T-21_CHS',
  'T-22_EN',
  'T-22_CHS',
  'T-23_EN',
  'T-23_CHS',
  'T-24_EN',
  'T-24_CHS',
  'T-25_EN',
  'T-25_CHS',
  'T-26_EN',
  'T-26_CHS',
  'T-27_EN',
  'T-27_CHT',
  'T-28_EN',
  'T-28_CHS',
  'T-29_EN',
  'T-29_CHS',
  'T-30_EN',
  'T-30_CHS',
  'T-31_EN',
  'T-31_CHS',
];

const W = [
  'W_EN',
  'W_CHS',
  'W-in_EN',
  'W-in_CHS',
  'W-1-50_EN',
  'W-1-50_CHS',
  'W-rI_EN',
  'W-rI_CHS',
  'W-61-80_EN',
  'W-61-80_CHS',
  'W-rII_EN',
  'W-rII_CHS',
  'W-91-110_EN',
  'W-91-110_CHS',
  'W-rIII_EN',
  'W-rIII_CHS',
  'W-121-140_EN',
  'W-121-140_CHS',
  'W-rIV_EN',
  'W-rIV_CHS',
  'W-151-170_EN',
  'W-151-170_CHS',
  'W-rV_EN',
  'W-rV_CHS',
  'W-181-200_EN',
  'W-181-200_CHS',
  'W-rVI_EN',
  'W-rVI_CHS',
  'W-pII-in_EN',
  'W-pII-in_CHS',
  'W-pII-1_EN',
  'W-pII-1_CHS',
  'W-pII-2_EN',
  'W-pII-2_CHS',
  'W-pII-3_EN',
  'W-pII-3_CHS',
  'W-pII-4_EN',
  'W-pII-4_CHS',
  'W-pII-5_EN',
  'W-pII-5_CHS',
  'W-pII-6_EN',
  'W-pII-6_CHS',
  'W-pII-7_EN',
  'W-pII-7_CHS',
  'W-pII-8_EN',
  'W-pII-8_CHS',
  'W-pII-9_EN',
  'W-pII-9_CHS',
  'W-pII-10_EN',
  'W-pII-10_CHS',
  'W-pII-11_EN',
  'W-pII-11_CHS',
  'W-pII-12_EN',
  'W-pII-12_CHS',
  'W-pII-13_EN',
  'W-pII-13_CHS',
  'W-pII-14_EN',
  'W-pII-14_CHS',
  'W-fl_EN',
  'W-fl_CHS',
  'W-ep_EN',
  'W-ep_CHS',
];

export const files = [...T.map(f => `T/${f}`), ...W.map(f => `W/${f}`)];
