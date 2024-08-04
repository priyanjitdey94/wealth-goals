<script lang="ts">
    import type { IGoal, IGoalParams } from "$lib/types/goal";
	import Fa from 'svelte-fa';
	import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
    import { JsonView } from "@zerodevx/svelte-json-view";

	let monthlyIncome: number;
	let age: number;
	let isMarried: string;
	let bankBalance: number;
	let equityBalance: number;
	let mfBalance: number;
	let properties: number;
	let propertyValue: number;

	let error: string;

	let apiLoading: boolean = false;
	let apiJSON: object | null = {
		test: true
	};
	let goals: IGoal[] = (JSON.parse("{\n \"goals\": [\n {\n \"type\": \"short-term\",\n \"title\": \"Emergency Fund\",\n \"description\": \"Build an emergency fund equivalent to 6 months of expenses to cover unforeseen circumstances.\",\n \"target_amount\": 720000,\n \"remaining_days\": 180\n },\n {\n \"type\": \"short-term\",\n \"title\": \"Travel Fund\",\n \"description\": \"Save for an international vacation to a destination of choice.\",\n \"target_amount\": 200000,\n \"remaining_days\": 365\n },\n {\n \"type\": \"mid-term\",\n \"title\": \"Down Payment for Property\",\n \"description\": \"Save for a down payment on a residential property.\",\n \"target_amount\": 1500000,\n \"remaining_days\": 1095\n },\n {\n \"type\": \"mid-term\",\n \"title\": \"Investment in High-Growth Stocks\",\n \"description\": \"Allocate funds to invest in high-growth stocks for potential higher returns.\",\n \"target_amount\": 500000,\n \"remaining_days\": 730\n },\n {\n \"type\": \"long-term\",\n \"title\": \"Retirement Corpus\",\n \"description\": \"Build a retirement corpus to ensure financial independence post-retirement.\",\n \"target_amount\": 20000000,\n \"remaining_days\": 14600\n }\n ]\n}")).goals;

	const isUndefined = (val: any) => typeof val === 'undefined';
	const fetchGoals = async (goalParams: IGoalParams) => {
		apiLoading = true;
		try {
			const res = await fetch('/api/goals', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...goalParams
				})
			})
			const resJson = await res.json();

			console.log('Received response', resJson);

			if (resJson.status === 500 || resJson.err) {
				apiJSON = {
					error: resJson.err
				}
			} else {
				const { wealthPlans } = resJson;
				const content = wealthPlans?.data?.choices?.[0]?.message?.content || '{}';
				apiJSON = {
					success: true,
					json: resJson
				}

				const goalObj = JSON.parse(content);

				if (Array.isArray(goalObj.goals)) {
					goals = goalObj.goals
				} else {
					throw new Error('Failed to find goals array in response.')
				}
			}
		} catch(err) {
			console.log('Error occured', err);
			apiJSON = {
				error: 'Some error occured'
			};
		} finally {
			apiLoading = false;
		}
	}
</script>
<div class="w-full p-4">
	<form class="mb-4">
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">What is your monthly income in INR?</span>
			</div>
			<input bind:value={monthlyIncome} type="number" placeholder="Type your income..." class="input input-bordered w-full" />
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">What is your age?</span>
			</div>
			<input bind:value={age} min="18" max="60" type="number" placeholder="Type your age..." class="input input-bordered w-full" />
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">Are you married?</span>
			</div>
			<select bind:value={isMarried} class="select select-bordered">
				<option disabled selected>Pick one</option>
				<option value="yes">Yes</option>
				<option value="no">no</option>
			</select>
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">What is your bank balance in INR?</span>
			</div>
			<input bind:value={bankBalance} type="number" placeholder="Type your bank balance..." class="input input-bordered w-full" />
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">How much you own in equity holdings in INR?</span>
			</div>
			<input bind:value={equityBalance} type="number" placeholder="Type your portfolio value..." class="input input-bordered w-full" />
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">How much mutual fund do you own in INR?</span>
			</div>
			<input bind:value={mfBalance} type="number" placeholder="Type your mf investment value..." class="input input-bordered w-full" />
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">How many properties do you own?</span>
			</div>
			<input bind:value={properties} type="number" placeholder="Number of properties(0 if none)..." class="input input-bordered w-full" />
		</label>
		<label class="form-control w-full mb-2">
			<div class="label">
				<span class="label-text">What is net worth of your properties in INR?</span>
			</div>
			<input bind:value={propertyValue} disabled={!properties} type="number" placeholder="Net worth of properties..." class="input input-bordered w-full" />
		</label>
	</form>

	<button class="btn btn-primary w-full" disabled={apiLoading} on:click={() => {
		if (
			isUndefined(monthlyIncome) ||
			isUndefined(age) ||
			isUndefined(isMarried) ||
			isUndefined(bankBalance) ||
			isUndefined(equityBalance) ||
			isUndefined(mfBalance) ||
			isUndefined(properties)
		) {
			error = 'Please fill in all the fields'
			return
		} else {
			error = '';
		}

		let curGoalParams = {
			income: monthlyIncome,
			age,
			marital_status: isMarried === 'yes' ? "married" : "single",
			current_bank_balance: bankBalance,
			current_stock_holdings: equityBalance,
			current_mf_holdings: mfBalance,
			real_estate: properties || 0,
			real_estate_worth: propertyValue || 0
		}
		fetchGoals(curGoalParams);
	}}>
		{#if apiLoading}
			<Fa icon={faCircleNotch} spin={true} />
		{/if}
		Get My Goals
	</button>

	{#if error}
		<div class="text-rose-600">
			{error}
		</div>
	{/if}

	<!-- {JSON.stringify(goals)} -->
	{#if Array.isArray(goals) && goals.length}
		<div class="mt-8 mb-2 bg-white border border-slate-300 rounded p-4">
			<div class="font-bold text-lg">Goals </div>
			{#each goals as g, idx}
				{@const isFirstGoal = idx === 0}
				{@const { title, description, type, target_amount, remaining_days } = g}
				<div class="py-4 {isFirstGoal ? "" : "border-t border-slate-200"}">
					<div class="font-bold mb-1">
						{title}
					</div>
					<div class="flex justify-between items-center text-sm text-slate-500 mb-2">
						<div>Target: {target_amount}</div>
						<div>Days remaining: {remaining_days}</div>
					</div>
					<div class="text-md">
						{description}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-4 mb-8 bg-white p-2">
		Raw response from api - 
		<JsonView json={apiJSON} />
	</div>
	<!-- {#if apiJSON}
	{/if} -->
</div>