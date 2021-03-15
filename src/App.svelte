<script lang="ts">
	import Container from './Container.svelte'
	import Text from './Text.svelte'
	import Banner from './Banner.svelte'
	import { exportImage } from './utils/export-img';

	let jobTitle: string = "Senior React Engineer", jobLocation: string = "Glasgow", jobSalary: string = "60 - 65k", contactInformation: string = "someone@neogen.com"

	let  additionalInformation: string = `
		Tech lead experience required.
	`
</script>

<main>
	<div id="ad">
		<Container>
			<Banner imgUrl="build/img/neogen.png" />
			<Text
				jobTitle={jobTitle}
				jobLocation={jobLocation}
				jobSalary={jobSalary}
				contactInformation={contactInformation}
				additionalInformation={additionalInformation}
			/>
		</Container>
	</div>
	<div class="inputs">
		<input placeholder="Enter job title" bind:value={jobTitle} />
		<input placeholder="Enter job location" bind:value={jobLocation} />
		<input placeholder="Enter job salary" bind:value={jobSalary} />
		<input placeholder="Enter contact information" bind:value={contactInformation} />
		<textarea placeholder="Enter additional information" bind:value={additionalInformation} />
		<button on:click={exportImage}>Export Image</button>
	</div>
</main>

<style>
	@media (min-width: 640px) {
		main {
			max-width: none;
			display: flex;
		}
	}
</style>