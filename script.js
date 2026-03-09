const shareMessage =
  "Join me celebrating International Attenborough Day on May 8 - a day dedicated to nature and the planet.";

const shareFeedback = document.querySelector(".share-feedback");
const shareButtons = document.querySelectorAll(".share-button");
const counters = document.querySelectorAll(".counter-number");
const sceneLinks = document.querySelectorAll("[data-scene-link]");
const scenes = document.querySelectorAll("[data-scene]");
const deferredVideos = document.querySelectorAll(".deferred-video");

const currentUrl = window.location.href;

if (window.location.protocol === "file:") {
  document.body.classList.add("hero-file-fallback");
}

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value);

const setShareFeedback = (message) => {
  if (shareFeedback) {
    shareFeedback.textContent = message;
  }
};

const openShareWindow = (url) => {
  window.open(url, "_blank", "noopener,noreferrer,width=640,height=720");
};

shareButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const platform = button.dataset.platform;
    const encodedText = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(currentUrl);

    if (platform === "x") {
      openShareWindow(
        `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
      );
      setShareFeedback("Opened X / Twitter share.");
      return;
    }

    if (platform === "reddit") {
      openShareWindow(
        `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
      );
      setShareFeedback("Opened Reddit share.");
      return;
    }

    if (platform === "facebook") {
      openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
      );
      setShareFeedback("Opened Facebook share.");
      return;
    }

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setShareFeedback("Link copied to clipboard.");
      } catch (error) {
        setShareFeedback("Copy failed. Please copy the URL manually.");
      }
    }
  });
});

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const duration = 1800;
  const startTime = performance.now();

  const step = (timestamp) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);

    element.textContent = formatNumber(value);

    if (progress < 1) {
      window.requestAnimationFrame(step);
      return;
    }

    element.textContent = formatNumber(target);
  };

  window.requestAnimationFrame(step);
};

const activateSceneLink = (sceneName) => {
  sceneLinks.forEach((link) => {
    const isActive = link.dataset.sceneLink === sceneName;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "true" : "false");
  });
};

const loadDeferredVideo = (video) => {
  if (video.dataset.loaded === "true") {
    return;
  }

  const source = video.querySelector("source[data-src]");

  if (!source) {
    return;
  }

  source.src = source.dataset.src;
  video.load();
  video.play().catch(() => {});
  video.dataset.loaded = "true";
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        instance.unobserve(entry.target);
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const sceneObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        activateSceneLink(entry.target.dataset.scene);
      });
    },
    { threshold: 0.6 }
  );

  scenes.forEach((scene) => sceneObserver.observe(scene));

  const videoObserver = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        loadDeferredVideo(entry.target);
        instance.unobserve(entry.target);
      });
    },
    { rootMargin: "300px 0px" }
  );

  deferredVideos.forEach((video) => videoObserver.observe(video));
} else {
  counters.forEach((counter) => animateCounter(counter));
  deferredVideos.forEach((video) => loadDeferredVideo(video));
}
