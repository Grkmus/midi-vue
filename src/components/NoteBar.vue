<template>
  <div class="note-bar">
    <div class="note" :style="note" :key="index" v-for="(note, index) in notes">
    </div>
  </div>
</template>

<script>
// import Note from './Note.vue';

export default {
  name: 'NoteBar',
  props: {
    note: {
      velocity: 0,
      delta: 0,
    },
  },
  data() {
    return {
      notes: [],
    };
  },
  methods: {
    createNote() {
      this.notes.push({
        height: '500px',
        top: '-500px',
      });
      console.log('Create note!');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.note-bar {
  width: 50px;
  height: auto;
  border: 1px solid rgba(70, 66, 66, 0.37);
  background-color: whitesmoke;
  margin: 0;
  padding: 0;
  position: relative;
}

.note {
  margin: 0;
  padding: 0;
  height: 50px;
  width: 100%;
  background-color: red ;
  position: absolute;
}

</style>
