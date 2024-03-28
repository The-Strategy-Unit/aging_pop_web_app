function startAnimation(callback) {
  let t0 = null;

  const frame = function(t) {
    let finished = false;

    if (t0 === null) { t0 = t; }
    else {
      const dt = t - t0;
      finished = callback(dt);
    }

    if (!finished) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
}


export { startAnimation };
