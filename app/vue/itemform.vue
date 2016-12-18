<template>
    <form class="item-form" @submit.prevent="submit">
        <tags :choices="autocomplete" :tags="tags"></tags>
        <input type="text" v-bind:value="date" v-on:input="dateChanged($event.target.value)" class="date numeric" autocomplete="off" placeholder="Date" required v-bind:disabled="disabled">
        <input type="number" v-model="price" class="price numeric" step="0.01" autocomplete="off" placeholder="Price" required v-bind:disabled="disabled">
    </form>
</template>

<script>
    let Tags = require('./tags.vue');
    let autocomplete = require('./../js/io').autocomplete;

    module.exports = {
        components: {
            Tags: Tags
        },
        props: {
            date: String,
            disabled: Boolean
        },
        data: function(){
            return {
                price: null,
                tags: []
            }
        },
        methods: {
            autocomplete: autocomplete,
            dateChanged(value){
                this.$emit('datechanged', value);
            },
            submit: function(e){
                let formData = new FormData();
                formData.append('price', this.price);
                formData.append('date', this.date);
                formData.append('tags', this.tags);

                this.$emit('submit', formData, () => {
                    this.price = null;
                    this.tags.splice(0, this.tags.length);
                });
            }
        }
    }
</script>