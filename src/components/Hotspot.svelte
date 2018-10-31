<div class="hotspot">
  <div class="pulse"></div>
  <div class="dot" style="background-color: {color}"></div>
</div>

<script>
export default {
  data: () => ({
    color: '#62A8FC',
  }),
};
</script>

<style lang="less">
.hotspot {
  position: absolute;
  width: 20px;
  margin: 25px;
  cursor: pointer;

  .dot {
    width: 20px;
    height: 20px;
    margin: -10px;
    position: absolute;
    top: 50%;
    left: 50%;

    border-radius: 50%;
    border: 2px solid gray;
    opacity: 0.6;
  }

  .pulse {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin: -10px;
    position: absolute;
    top: 50%;
    left: 50%;

    border: 2px solid #ccc;
    animation: pulsate 2s ease-out;
    animation-iteration-count: infinite;
  }

  @keyframes pulsate {
    0% {
      transform: scale(1.0, 1.0);
      opacity: 0.9;
    }
    100% {
      transform: scale(2.5, 2.5);
      opacity: 0.0;
    }
  }
}
</style>