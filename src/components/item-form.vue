<template>
    <form class="item-form" @submit.prevent="submit">
        <tags :choices="autocomplete()"
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
               :value="pDate"
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
    import TagInput from './tag-input';
    import IO from '@/services/io';
    import {mapGetters} from "vuex";


    export default {
      components: {
        Tags: TagInput
      },
      props: {
        date:  {
          type: String,
          required: false,
          default: () => ''
        },
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
          pTags: this.tags.slice(),
          pDate: this.date
        }
      },
      methods: {
        ...mapGetters('tags', ['autocomplete']),
        dateChanged(value){
          this.pDate = value;
        },
        rawPrice(){
          let price = this.$refs.price;

          price.select();
          let value = window.getSelection().toString();
          price.blur();

          let sign = value[0];

          if(!(sign === '+') && !(sign === '-')){
            value = -1 * Number(value);
          }

          return value;
        },
        submit(){
          let item = {
            price: this.rawPrice(),
            date: this.pDate,
            tags: this.pTags
          };

          this.$emit('submit', {
            item,
            callback: () =>{
              this.pPrice = null;
              this.pTags.splice(0, this.pTags.length);
            }
          });
        },
        focusPrice(){
          this.$refs.price.focus();
        }
      },
      watch: {
        date(nextValue){
          this.pDate = nextValue;
        }
      }
    };

</script>
