<svelte:window on:resize="position()" on:scroll="position()" on:orientationchange="position()"></svelte:window>
<div ref:container class="text-container">
  <div ref:text class="text" style="font-size: {textSize}vmin; line-height: {textSize}vmin;">{ text }</div>
</div>

<style lang="less">
@import 'src/main';

.text-container {
  position: fixed;
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  padding: 5vmin;
  z-index: @zindex + 2;
}

.text {
  /* font-size: 11vmin; */
  font-family: 'Short Stack', cursive; // TODO: dynamic
  /* line-height: 11vmin; // 11vmin looks better sometimes */
  color: #fefefe;
  text-shadow: 2px 2px #333;
  /* z-index: 2; */
  word-break: break-word;
  hyphens: auto;
}
</style>

<script>
import isDom from 'is-dom';
import raf from 'raf';

export default {
  data: () => ({
    text: '',
    target: null,
    textSize: 11,
  }),
  onstate({ changed, current }) {
    if (changed.target && isDom(current.target)) {
      raf(() => {
        this.position();
      });
    }
  },
  methods: {
    position() {
      const box = chooseRenderBox(this.get().target);

      this.refs.container.style.top = box.top + 'px';
      this.refs.container.style.left = box.left + 'px';
      this.refs.container.style.width = box.width + 'px';
      this.refs.container.style.height = box.height + 'px';

      const vmin = Math.min(document.body.offsetHeight, document.body.offsetWidth);
      // Quadratic function to fit vmin size to actual vmin so it looks nice
      const textSize = Math.max(6, -0.0000163847 * vmin**2 + 0.0102378 * vmin + 7.47434);
      this.set({ textSize });
    }
  }
}

function chooseRenderBox(elm) {
  const [box1, box2] = splitScreen();

  // See if the element is in box1 or box2;
  const elmMiddle = middleOfNode(elm);
  const flooredElmMiddle = { x: Math.floor(elmMiddle[0]), y: Math.floor(elmMiddle[1]) };

  if (rectContains(flooredElmMiddle, box1)) return box2;
  else return box1;
}

function splitScreen() {
  // const pixelRatio = window.devicePixelRatio || 1;
  const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  let box1;
  let box2;

  // Split vertically
  if (w > h) {
    const boxWidth = Math.floor(w / 2);
    box1 = {
      top: 0,
      left: 0,
      height: h,
      width: boxWidth,
    };
    box2 = {
      top: 0,
      left: boxWidth,
      height: h,
      width: w - boxWidth,
    };
  } else {
    const boxHeight = Math.floor(h / 2);
    box1 = {
      top: 0,
      left: 0,
      height: boxHeight,
      width: w,
    };
    box2 = {
      top: boxHeight,
      left: 0,
      height: h - boxHeight,
      width: w,
    };
  }

  return [box1, box2];
}

function elementRect(node, offsetParent) {
  if (offsetParent === true) offsetParent = node.offsetParent;

  const rect = node.getBoundingClientRect();
  const prect = offsetParent ?
    offsetParent.getBoundingClientRect() :
    { left: 0, top: 0 };

  return {
    left: rect.left - prect.left,
    top: rect.top - prect.top,
    width: rect.width,
    height: rect.height,
  };
}

function middleOfNode(node) {
  let rect = node;
  if (node instanceof Node) {
    rect = elementRect(node, false);
  }

  return [rect.left + (rect.width / 2), rect.top + (rect.height / 2)];
}

function rectContains({ x, y }, { left, top, width, height }) {
  return left <= x && x <= left + width &&
         top <= y && y <= top + height;
}
</script>
