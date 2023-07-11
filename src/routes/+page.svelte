<script lang="ts">
	interface Spell {
		element?: HTMLElement;
		name: string;
	}

	let spells: Spell[] = [
		{ name: 'Fire' },
		{ name: 'Water' },
		{ name: 'Air' },
		{ name: 'Earth' },
		{ name: 'Electricity' },
		{ name: 'Light' },
		{ name: 'Dark' }
	];

	let userSpells: Spell[] = [];

	let slotOne: Spell;
	let slotTwo: Spell;

	function onDragStart(e: DragEvent, who: Spell) {
		e.dataTransfer!.dropEffect = 'move';
		e.dataTransfer?.setData('text/plain', JSON.stringify(who));
	}

	function onDrop(e: DragEvent, slot: 'One' | 'Two') {
		e.preventDefault();
		const json = e.dataTransfer?.getData('text/plain')!;
		const data = JSON.parse(json) as Spell;
		if (slot == 'One') {
			slotOne = data;
		} else {
			slotTwo = data;
		}
	}

	async function onSumbitCombination(e: MouseEvent) {
		e.preventDefault();
		const res = await fetch('/api/chat', {
			body: JSON.stringify({ spells: [slotOne.name, slotTwo.name] }),
			method: 'POST'
		});
		const json = await res.json();
		userSpells = [...userSpells, json];
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}
</script>

<h1>Wizardy</h1>
<div class="container">
	<div
		class="dropper"
		role="presentation"
		on:drop={(e) => onDrop(e, 'One')}
		on:dragover={onDragOver}
	>
		{#if slotOne}
			{slotOne.name}
		{/if}
	</div>

	<h1>+</h1>

	<div
		class="dropper"
		role="presentation"
		on:drop={(e) => onDrop(e, 'Two')}
		on:dragover={onDragOver}
	>
		{#if slotTwo}
			{slotTwo.name}
		{/if}
	</div>
</div>

<div>
	<div>
		{#each spells as spell, index}
			<div
				class="block"
				draggable="true"
				role="presentation"
				on:dragstart={(e) => onDragStart(e, spell)}
			>
				{spell.name}
			</div>
		{/each}
	</div>

	<div>
		<h2>User Spells:</h2>
		{#each userSpells as userSpell}
			<div
				class="block"
				draggable="true"
				role="presentation"
				on:dragstart={(e) => onDragStart(e, userSpell)}
			>
				{userSpell.name}
			</div>
		{/each}
	</div>
</div>

<div>
	<button on:click={onSumbitCombination}>Submit</button>
</div>

<style>
	.container {
		display: flex;
		align-items: center;
	}
	.dropper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: auto;
		min-width: 100px;
		height: 100px;
		margin: 10px;
		padding: 8px;
		border: #fff 2px solid;
	}

	.block {
		display: inline-block;
		border: #dfbc6a 1px solid;
		width: auto;
		height: 50px;
		margin: 10px;
		padding: 8px;
		font-size: 18px;
		text-align: center;
		box-shadow: 2px 2px 2px #999;
		cursor: move;
	}
</style>
