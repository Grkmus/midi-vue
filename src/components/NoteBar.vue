<template>
  <div class="note-bar">
    <div class="note"
    :style="{transform: `translateY(${currentTick}px)`}"
    :ref="index"
    :key="index"
    v-for="(note, index) in notes">
    </div>
  </div>
</template>

<script>

export default {
  name: 'NoteBar',
  props: {
    currentTick: null,
  },
  data() {
    return {
      counter: 0,
      notes: [],
      height: 100,
      start: null,
      speed: 0.5,
    };
  },
  methods: {
    createNote() {
      this.$set(this.notes, this.counter, {
        height: this.height,
        transform: `translateY(${this.tick}px)`,
      });
      this.counter += 1;
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
