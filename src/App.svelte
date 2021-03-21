<script lang="ts">
	import Container from './Container.svelte'
	import Text from './Text.svelte'
	import Banner from './Banner.svelte'
	import { exportImage } from './utils/export-img';

	let jobTitle: string = "Senior React Engineer";
	let jobLocation: string = "Glasgow";
	let jobSalary: string = "60 - 65k";
	let contactInformation: string = "someone@neogen.com";

	let  additionalInformation: string = `
		Azure deployments & automation. ARM and or Terraform.
	`

	let additionalInformationFontSize: string = "20px"
</script>

<main>
	<div id="ad">
		<Container>
			<Banner imgUrl="https://i.ibb.co/kXYB4MX/neogen.png" />
			<Text
				jobTitle={jobTitle}
				jobLocation={jobLocation}
				jobSalary={jobSalary}
				contactInformation={contactInformation}
				additionalInformation={additionalInformation}
				additionalInformationFontSize={additionalInformationFontSize}
			/>
		</Container>
	</div>
	<div class="inputs">
		<input placeholder="Enter job title" bind:value={jobTitle} />
		<input placeholder="Enter job location" bind:value={jobLocation} />
		<input placeholder="Enter job salary" bind:value={jobSalary} />
		<input placeholder="Enter contact information" bind:value={contactInformation} />
		<textarea placeholder="Enter additional information" bind:value={additionalInformation} />
		<input placeholder="Additional Information Font Size" bind:value={additionalInformationFontSize} />
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