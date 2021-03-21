<script lang="ts">
    export let jobTitle: string;
    export let jobLocation: string;
    export let jobSalary: string;
    export let contactInformation: string;
    export let additionalInformation: string;

    export let additionalInformationFontSize: string;
</script>

<main>
    <h1>{jobTitle}</h1>
    <section>
        <div style="--font-size: {additionalInformationFontSize}" class="additional-information">
            {@html additionalInformation}          
        </div>
        <div>
            <h2>{jobLocation && `${jobLocation},`} {jobSalary}</h2>
            <h3>{contactInformation && `Enquiries: ${contactInformation}`}</h3>
        </div>
    </section>
</main>

<style>
    /* latin-ext */
    @font-face {
        font-family: 'Zilla Slab';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/zillaslab/v6/dFa5ZfeM_74wlPZtksIFYpEY6H2pW3pwfa3Efg.woff2) format('woff2');
        unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }
    /* latin */
    @font-face {
        font-family: 'Zilla Slab';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url(https://fonts.gstatic.com/s/zillaslab/v6/dFa5ZfeM_74wlPZtksIFYpEY6HOpW3pwfa0.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

    main {
        position: absolute;
        width: 80%;
        top: 70px;
        left: 50%;
        transform: translateX(-55%);
    }

    h1 {
        font-size: 80px;
        text-align: left;
        color: white;
        margin-bottom: 30px;
        font-family: 'Zilla Slab';
    }

    section {
        display: flex;
    }

    h2 {
        text-align: right;
        font-size: 50px;
        color: #12E4E7;
        margin: 0;
        font-family: 'Zilla Slab';
    }

    h3 {
        text-align: right;
        color: #12E4E7;
        margin-top: 25px;
    }

    .additional-information {
        margin-top: 180px;
        padding: 32px;
        flex: 1;
        line-height: 40px;
        color: #FCB97D;
        font-size: var(--font-size);
        font-weight: bold;
    }
</style>