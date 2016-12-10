<template>
    <div id="item-list" :class="{loading: loading}">
        <div id="title"></div>
        <div id="main-item-form">
            <item-form id="item-form-0"></item-form>
            <button type="submit" form="item-form-0">+</button>
        </div>

        <div id="date-items-list">
            <date-items v-for="dateItems of dates" :date="dateItems.date" :items="dateItems.items"></date-items>
        </div>

        <button id="edit">Edit</button>

        <div id="footer">WIMM</div>
    </div>
</template>

<script>
    let io = require('./../js/io');

    let ItemForm = require('./itemform.vue');
    let DateItems = require('./dateitems.vue');

    module.exports = {
        components: {
            'item-form': ItemForm,
            'date-items': DateItems
        },
        created: function(){
            this.loadMonth(this.$route.params);
        },
        data(){
            return {
                loading: false,
                dates: []
            }
        },
        methods: {
            loadMonth({year, month}){
                this.loading = true;

                io.items.loadMonth({year, month})
                .then(dates => {
                    dates.sort((left, right) => left.date <= right.date);
                    this.dates = dates;

                    this.loading = false;
                });
            }
        },
        watch: {
            $route(to){
                console.log(to);
            }
        }
    };
</script>