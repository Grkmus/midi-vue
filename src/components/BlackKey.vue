<template>
  <div v-bind:class="{ pressed: currentVelocity}" class="black-key">
  </div>
</template>

<script>
export default {
  name: 'BlackKey',
  props: {
    velocity: Number,
    note: String,
  },
  data() {
    return {
      currentVelocity: 0,
    };
  },
  methods: {
    pressKey(velocity) {
      console.log('we are setting velocity to:', velocity);
      this.currentVelocity = velocity;
    },
    releaseKey() {
      this.currentVelocity = 0;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.pressed {
  background-color: orangered;
}
</style>
