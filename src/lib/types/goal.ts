export interface IGoalParams {
    income: number;
    age: number;
    marital_status: string,
    // gender: 'male' | 'female' | 'other',
    // city?: string,
    current_bank_balance?: number;
    current_stock_holdings?: number;
    current_mf_holdings?: number;
    real_estate?: number;
    real_estate_worth?: number;
}

export const enum GOAL_DURATION {
    SHORT = 'short-tem',
    MID = 'mid-term',
    LONG = 'long-term'
}
export interface IGoal {
    type: GOAL_DURATION;
    title: string;
    description: string;
    target_amount: number;
    remaining_days: number;
};