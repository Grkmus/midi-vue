<template>
  <div class="note-bar">
    <note v-bind:class="{ playing: velocity}"></note>
  </div>
</template>

<script>
import Note from './Note.vue';

export default {
  name: 'NoteBar',
  components: {
    Note,
  },
  props: {
    velocity: null,
    delta: null,
    // tick: null,
  },
  watch: {
    velocity(oldVal, newVal) {
      console.log(oldVal, newVal, 'watching!', this._uid); // eslint-disable-line
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.note-bar {
  width: 50px;
  height: 700px;
  border: solid;
  background-color: whitesmoke;
  margin: auto;  /* Magic! */
}

</style>
