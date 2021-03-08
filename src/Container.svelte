<script lang="ts">

</script>

<div class="container-div">
    <div>
        <slot />
    </div>
</div>

<style>
    .container-div {
        background: url('img/bg.svg');
        height: 738px;
        width: 998px;
        position: relative;
    }

    .container-div > div {
        position: absolute;
        width: 998px;
        height: 738px;
        box-sizing: border-box;
    }
</style>

