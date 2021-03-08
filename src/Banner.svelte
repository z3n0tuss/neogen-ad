<script lang="ts">
    export let imgUrl: string
</script>

<div>
    <img src={imgUrl} alt="banner" />
</div>

<style>
    img {
        max-height: 150px;
        bottom: 0;
        right: 0;
        position: absolute;
    }
</style>