<script>
  import "../lib/styles.css";
  import { onMount } from "svelte";
  import { installPressFeedback } from "../lib/motion/press-feedback.js";
  onMount(installPressFeedback);
  let { children } = $props();
</script>

<svelte:head>
  <link
    rel="preload"
    href="/assets/barlow-condensed-black.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  />
  <link
    rel="preload"
    href="/assets/space-grotesk.woff2"
    as="font"
    type="font/woff2"
    crossorigin="anonymous"
  />
</svelte:head>

{@render children()}
