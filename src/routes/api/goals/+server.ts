import { OPENAI_API_KEY, OPENAI_ENDPOINT } from "$env/static/private";
import type { IGoalParams } from "$lib/types/goal.js";
import { json } from "@sveltejs/kit"

const getWealthPlan = async ({
    income,
    age,
    marital_status,
    current_bank_balance,
    current_stock_holdings,
    current_mf_holdings,
    real_estate,
    real_estate_worth
}: IGoalParams) => {
    try {
        let userPrompt = `My monthly income is ${income}. My age is ${age}. I am ${marital_status}.`

        userPrompt += ` I have ${current_bank_balance || 0} indian rupees in bank.`
        userPrompt += ` I have invested ${current_stock_holdings || 0} indian rupees in stocks`
        userPrompt += ` I have invested ${current_mf_holdings || 0} indian rupees in mutual-funds`
        userPrompt += ` I have ${real_estate} properties.`
        userPrompt += ` My properties are worth ${real_estate_worth} indian rupees`
        userPrompt += ` Please suggest financial goals based on the data provided.`

        const res = await fetch(`${OPENAI_ENDPOINT}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                temperature: 0.6,
                response_format: {
                    type: 'json_object'
                },
                max_tokens: 4096,
                messages: [{
                    role: 'system',
                    // - The financial goals can be buying a house, buying a car, marriage, emergency fund, foreign vacations etc. You are free to suggest other financial goals too as you deem fit.
                    content: `Assume the role of a wealth planner or financial advisor or wealth manager. You will be provided with the monthly income, age, gender, marital status and current financial net worth of an individual who is a resident of India. You have to plan financial goals based on the information provided. Please take the following into consideration while planning goals-
                    - Provide 5 goals.
                    - Out of 5 goals, 2 goals can be risky and rest 3 can be conservative/promising/ensures good return of investment.
                    - Out of 5 goals, 2 goals can be short-term, 2 goals be mid-term and 1 goal be long-term.
                    - Provide realistic and achievable goals, do not provide outlandish goals.
                    - Please consider the fact that older people will be more risk-averse compared to younger people while setting up goals.
                    - Please consider the marital status of the individual. People who are married may have low apetite for risk compared to single people.
                    `
                }, {
                    role: 'system',
                    content: `Based on the instructions provided in the previous message, you have to return 5 goals in an array in JSON format. The format of the JSON is described below. You must adhere to the JSON format.
                    JSON format - [{
                        type: // short-term, mid-term or long-term
                        title: // title of the goal
                        description: // description of the goal.
                        target_amount: // The amount in rupees being targetted to achieve in this goal. This should be of type number.
                        remaining_days: // Number of days in which the goal must be reached. This should be of type number.
                    }, ... 4 more goals]
                    `
                }, {
                    role: 'user',
                    content: userPrompt
                }]
            })
        })
        const resJSON = await res.json();

        // console.log('Received response from openai', resJSON);

        if (res.ok) {
            return {
                status: res.status,
                data: resJSON
            }
        } else {
            return {
                status: res.status,
                data: resJSON,
                err: new Error('Some error occured')
            }
        }
    } catch(err) {
        console.log('Error occured while fetching from openai', err);
        return {
            status: 500,
            data: null,
            err
        }
    }
}

export const POST = async ({ request }) => {
    const goalParams: IGoalParams = await request.json();
    const wealthPlans = await getWealthPlan(goalParams);

    return json({
        ok: true,
        wealthPlans
    })
}