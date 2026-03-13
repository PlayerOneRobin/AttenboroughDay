const shareMessage =
  "Join me celebrating International Attenborough Day on May 8 - a day dedicated to nature and the planet.";

const shareFeedback = document.querySelector(".share-feedback");
const shareButtons = document.querySelectorAll(".share-button");
const counters = document.querySelectorAll(".counter-number");
const sceneLinks = document.querySelectorAll("[data-scene-link]");
const scenes = document.querySelectorAll("[data-scene]");
const deferredVideos = document.querySelectorAll(".deferred-video");
const pingPongGroups = document.querySelectorAll("[data-ping-pong-group]");
const pageSections = document.querySelectorAll("main > section");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  if (video.dataset.playback !== "ping-pong") {
    video.play().catch(() => {});
  }

  video.dataset.loaded = "true";
};

const attachPingPongPlayback = (group) => {
  if (group.dataset.pingPongAttached === "true") {
    return;
  }

  const videos = Array.from(group.querySelectorAll('[data-playback="ping-pong"]'));
  const forwardVideo = videos.find((video) => video.dataset.direction === "forward");
  const reverseVideo = videos.find((video) => video.dataset.direction === "reverse");

  if (!forwardVideo || !reverseVideo) {
    return;
  }

  let isVisible = false;
  let activeVideo = forwardVideo;

  group.dataset.pingPongAttached = "true";

  videos.forEach((video) => {
    video.loop = false;
  });

  const syncActiveState = () => {
    videos.forEach((video) => {
      video.classList.toggle("is-active", video === activeVideo);
    });
  };

  const pauseAll = () => {
    videos.forEach((video) => {
      video.pause();
    });
  };

  const primeVideo = (video) => {
    if (video.dataset.loaded !== "true" || video.dataset.primed === "true") {
      return;
    }

    const playAttempt = video.play();

    if (!playAttempt || typeof playAttempt.then !== "function") {
      video.pause();
      video.currentTime = 0;
      video.dataset.primed = "true";
      return;
    }

    playAttempt
      .then(() => {
        window.setTimeout(() => {
          video.pause();
          video.currentTime = 0;
          video.dataset.primed = "true";
        }, 80);
      })
      .catch(() => {});
  };

  const playActive = () => {
    if (!isVisible || activeVideo.dataset.loaded !== "true") {
      return;
    }

    activeVideo.currentTime = 0;
    activeVideo.play().catch(() => {});
  };

  const switchTo = (nextVideo) => {
    if (activeVideo === nextVideo) {
      return;
    }

    activeVideo.pause();
    activeVideo.currentTime = 0;
    activeVideo = nextVideo;
    syncActiveState();
    playActive();
  };

  forwardVideo.addEventListener("ended", () => {
    switchTo(reverseVideo);
  });

  reverseVideo.addEventListener("ended", () => {
    switchTo(forwardVideo);
  });

  videos.forEach((video) => {
    video.addEventListener("loadeddata", () => {
      if (isVisible && video !== activeVideo) {
        primeVideo(video);
      }

      if (video === activeVideo) {
        playActive();
      }
    });
  });

  group.setPingPongVisibility = (visible) => {
    isVisible = visible;

    if (!isVisible) {
      pauseAll();
      return;
    }

    videos.forEach((video) => {
      if (video !== activeVideo) {
        primeVideo(video);
      }
    });

    playActive();
  };
};

const createSnapController = () => {
  if (pageSections.length < 2) {
    return {
      refresh() {},
      syncPreference() {},
    };
  }

  const SNAP_IDLE_MS = 140;
  const SNAP_COMMIT_THRESHOLD = 0.14;
  const SNAP_TALL_SECTION_RATIO = 1.35;
  const SNAP_SETTLE_TOLERANCE = 2;
  const SNAP_COOLDOWN_MS = 520;

  let sections = [];
  let lastScrollY = window.scrollY;
  let lastDirection = 0;
  let idleTimer = 0;
  let snapCooldownUntil = 0;
  let programmaticTargetY = null;

  const refresh = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    sections = Array.from(pageSections)
      .map((section) => ({
        top: Math.round(section.offsetTop),
        height: section.offsetHeight,
        forceSnap:
          section.matches(".hero, .manifesto, .scene") ||
          section.dataset.snap === "force",
      }))
      .filter(
        (section) =>
          section.forceSnap || section.height <= viewportHeight * SNAP_TALL_SECTION_RATIO
      );
  };

  const clearIdleTimer = () => {
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = 0;
    }
  };

  const scrollToSection = (section) => {
    if (!section) {
      return;
    }

    programmaticTargetY = section.top;
    snapCooldownUntil = Date.now() + SNAP_COOLDOWN_MS;

    window.scrollTo({
      top: section.top,
      behavior: "smooth",
    });
  };

  const releaseProgrammaticLock = () => {
    if (programmaticTargetY === null) {
      return;
    }

    if (
      Math.abs(window.scrollY - programmaticTargetY) <= SNAP_SETTLE_TOLERANCE ||
      Date.now() >= snapCooldownUntil
    ) {
      programmaticTargetY = null;
      lastScrollY = window.scrollY;
    }
  };

  const pickSnapTarget = () => {
    if (sections.length < 2) {
      return null;
    }

    const scrollY = window.scrollY;

    if (scrollY <= sections[0].top + SNAP_SETTLE_TOLERANCE) {
      return null;
    }

    const lastSection = sections[sections.length - 1];
    if (scrollY >= lastSection.top - SNAP_SETTLE_TOLERANCE) {
      return null;
    }

    let previousSection = sections[0];
    let nextSection = sections[sections.length - 1];

    for (let index = 0; index < sections.length - 1; index += 1) {
      const currentSection = sections[index];
      const followingSection = sections[index + 1];

      if (scrollY >= currentSection.top && scrollY < followingSection.top) {
        previousSection = currentSection;
        nextSection = followingSection;
        break;
      }
    }

    const gap = nextSection.top - previousSection.top;
    if (gap <= 0) {
      return null;
    }

    const progress = (scrollY - previousSection.top) / gap;

    if (lastDirection > 0) {
      return progress >= SNAP_COMMIT_THRESHOLD ? nextSection : previousSection;
    }

    if (lastDirection < 0) {
      return progress <= 1 - SNAP_COMMIT_THRESHOLD ? previousSection : nextSection;
    }

    const previousDistance = Math.abs(scrollY - previousSection.top);
    const nextDistance = Math.abs(nextSection.top - scrollY);

    return previousDistance <= nextDistance ? previousSection : nextSection;
  };

  const maybeSnap = () => {
    idleTimer = 0;

    if (prefersReducedMotion.matches) {
      return;
    }

    if (programmaticTargetY !== null || Date.now() < snapCooldownUntil) {
      return;
    }

    const targetSection = pickSnapTarget();
    if (!targetSection) {
      return;
    }

    if (Math.abs(window.scrollY - targetSection.top) <= SNAP_SETTLE_TOLERANCE) {
      return;
    }

    scrollToSection(targetSection);
  };

  const scheduleSnap = () => {
    clearIdleTimer();
    idleTimer = window.setTimeout(maybeSnap, SNAP_IDLE_MS);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;

    if (prefersReducedMotion.matches) {
      lastScrollY = currentScrollY;
      return;
    }

    if (programmaticTargetY !== null) {
      releaseProgrammaticLock();

      if (programmaticTargetY !== null) {
        lastScrollY = currentScrollY;
        return;
      }
    }

    if (Math.abs(delta) > SNAP_SETTLE_TOLERANCE) {
      lastDirection = delta > 0 ? 1 : -1;
      scheduleSnap();
    }

    lastScrollY = currentScrollY;
  };

  refresh();

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", () => {
    refresh();
    scheduleSnap();
  });

  const syncPreference = () => {
    clearIdleTimer();
    programmaticTargetY = null;
    lastScrollY = window.scrollY;

    if (!prefersReducedMotion.matches) {
      refresh();
    }
  };

  return { refresh, syncPreference };
};

const snapController = createSnapController();

pingPongGroups.forEach((group) => attachPingPongPlayback(group));

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

  const pingPongObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.setPingPongVisibility?.(entry.isIntersecting);
      });
    },
    { threshold: 0.35 }
  );

  pingPongGroups.forEach((group) => pingPongObserver.observe(group));
} else {
  counters.forEach((counter) => animateCounter(counter));
  deferredVideos.forEach((video) => loadDeferredVideo(video));
  pingPongGroups.forEach((group) => group.setPingPongVisibility?.(true));
}

if (prefersReducedMotion.addEventListener) {
  prefersReducedMotion.addEventListener("change", () => {
    snapController.syncPreference();
  });
}
