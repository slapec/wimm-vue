<template>
    <form class="item-form" @submit.prevent="submit">
        <tags :choices="autocomplete"
              :tags="tags"
              @blur="focusPrice()"
        ></tags>
        <input type="text"
               class="date numeric"
               autocomplete="off"
               placeholder="Date"
               required
               v-if="!datehidden"
               @input="dateChanged($event.target.value)"
               v-bind:value="date"
               v-bind:disabled="disabled">
        <input type="number"
               class="price numeric"
               step="0.01"
               autocomplete="off"
               placeholder="Price"
               required
               ref="price"
               v-model="price"
               v-bind:disabled="disabled">
    </form>
</template>

<script>
    let Tags = require('./tags.vue');

    module.exports = {
        components: {
            Tags: Tags
        },
        props: {
            date: String,
            disabled: Boolean,
            datehidden: String
        },
        data: function(){
            return {
                price: null,
                tags: []
            }
        },
        methods: {
            autocomplete: require('./../js/io').autocomplete,
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
            },
            focusPrice(){
                this.$refs.price.focus();
            }
        }
    }
</script>