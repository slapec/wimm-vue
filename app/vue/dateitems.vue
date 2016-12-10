<template>
    <div class="date-items">
        <div class="numeric date-items-head">{{ date }}</div>
        <ul class="items">
            <li v-for="item of items">
                <div class="tag-list">
                    <span v-for="tag of item.tags">{{ tag }}</span>
                </div>
                <span class="numeric price">{{ item.price }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
    module.exports = {
        props: {
            date: String,
            items: Array
        }
    }
</script>