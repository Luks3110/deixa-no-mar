<script>
  import MarineWorld from "./MarineWorld.svelte";
</script>

<section class="sea-voice" aria-labelledby="voice-title">
  <div class="voice-art">
    <MarineWorld
      mode="hero"
      label="Pepino-do-mar alaranjado vivo no habitat celular, junto ao sedimento."
    />
    <p>O lugar dele é aqui.</p>
  </div>
  <div class="voice-copy">
    <p class="voice-eyebrow">Essa causa precisa sair da nossa bolha.</p>
    <h2 id="voice-title">
      Ele não<br />tem voz.<br /><span>A gente tem.</span>
    </h2>
    <p>Compartilhe a causa. Cobre proteção. Denuncie o comércio ilegal.</p>
    <a class="button" href="#agir"
      >Transforme em cartaz <span aria-hidden="true">↘</span></a
    >
  </div>
</section>

<style>
  .sea-voice {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    align-items: center;
    gap: 6%;
    padding: 100px 7%;
    background: #edf0df;
    color: #153d42;
    overflow: hidden;
  }
  .voice-art {
    transform: rotate(-4deg);
  }
  .voice-art > p {
    font-size: 17px;
    margin-top: 18px;
    text-align: center;
  }
  .voice-copy h2 {
    font-size: clamp(52px, 5.6vw, 88px);
    font-weight: 500;
    line-height: 0.98;
    letter-spacing: -0.055em;
    margin: 28px 0;
  }
  .voice-copy h2 span {
    color: #a84b2c;
  }
  .voice-eyebrow {
    font-size: 15px;
    max-width: 29ch;
  }
  .voice-copy > p:not(.voice-eyebrow) {
    font-size: 20px;
    max-width: 30ch;
    line-height: 1.45;
    margin-bottom: 28px;
  }
  .voice-copy .button {
    font-size: 16px;
    background: #153d42;
    color: #edf0df;
    padding: 17px 22px;
  }
  @media (max-width: 800px) {
    .sea-voice {
      grid-template-columns: 1fr;
      padding: 60px 6%;
      gap: 35px;
    }
    .voice-copy {
      grid-row: 1;
    }
    .voice-copy h2 {
      font-size: 58px;
    }
    .voice-art {
      width: 90%;
      justify-self: center;
    }
    .voice-copy > p:not(.voice-eyebrow) {
      font-size: 18px;
    }
    .voice-art > p {
      font-size: 15px;
    }
  }
</style>
