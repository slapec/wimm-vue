<template>
    <form class="item-form" @submit.prevent="submit">
        <tags :choices="autocomplete" :tags="tags"></tags>
        <input type="text" v-model="date" class="date numeric" autocomplete="off" placeholder="Date" required>
        <input type="number" v-model="price" class="price numeric" step="0.01" autocomplete="off" placeholder="Price" required>
    </form>
</template>

<script>
    let Tags = require('./tags.vue');
    let autocomplete = require('./../js/io').autocomplete;

    module.exports = {
        components: {
            Tags: Tags
        },
        data: function(){
            return {
                price: null,
                date: '2016-12-08',
                tags: []
            }
        },
        methods: {
            autocomplete: autocomplete,
            submit: function(){
                console.log(this);
            }
        }
    }
</script>