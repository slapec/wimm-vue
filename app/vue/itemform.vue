<template>
    <form class="item-form" @submit.prevent="submit">
        <tags :choices="autocomplete"
              :tags="pTags"
              :disabled="disabled"
              @blur="focusPrice()"
        ></tags>
        <input type="text"
               class="date numeric"
               autocomplete="off"
               placeholder="Date"
               required
               v-if="!datehidden"
               @input="dateChanged($event.target.value)"
               :value="date"
               :disabled="disabled">
        <input type="number"
               class="price numeric"
               step="0.01"
               autocomplete="off"
               placeholder="Price"
               required
               ref="price"
               v-model="pPrice"
               :disabled="disabled">
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
            price: {
                type: [Number, String],
                required: false,
                default: () => null
            },
            tags: {
                type: Array,
                required: false,
                default: () => []
            },
            disabled: Boolean,
            datehidden: String
        },
        data(){
            return {
                pPrice: this.price,
                pTags: this.tags.slice()
            }
        },
        methods: {
            autocomplete: require('./../js/io').autocomplete,
            dateChanged(value){
                this.$emit('dateChanged', value);
            },
            submit(){
                let item = {
                    price: this.pPrice,
                    date: this.date,
                    tags: this.pTags
                };

                this.$emit('submit', {
                    item,
                    callback: () => {
                        this.pPrice = null;
                        this.pTags.splice(0, this.pTags.length);
                    }
                });
            },
            focusPrice(){
                this.$refs.price.focus();
            }
        }
    }
</script>