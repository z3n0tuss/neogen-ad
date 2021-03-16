<script lang="ts">

</script>

<div class="container-div">
    <div>
        <slot />
    </div>
</div>

<style>
    .container-div {
        background: url('https://i.ibb.co/TvrNwfr/bg.png');
        height: 738px;
        width: 998px;
        position: relative;
        background-size: cover;
    }

    .container-div > div {
        position: absolute;
        width: 998px;
        height: 738px;
        box-sizing: border-box;
    }
</style>

