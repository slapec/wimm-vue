<template>
    <div id="tools">
        <button class="fa fa-wrench"></button>
        <button class="fa fa-pencil" @click="toggleEdit"></button>
        <button class="fa fa-trash" @click="toggleDelete"></button>
    </div>
</template>

<script>
    module.exports = {
        data(){
            return {
                isEditing: false,
                isDeleting: false
            }
        },
        methods: {
            toggleEdit(){
                this.isEditing = !this.isEditing;
                if(this.isEditing){

                }
            },
            toggleDelete(){
                this.isDeleting = !this.isDeleting;
                this.$emit('deleting', this.isDeleting);
            }
        }
    }
</script>