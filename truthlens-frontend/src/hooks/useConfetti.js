import confetti from "canvas-confetti";

export function useConfetti() {
  const fire = (verdict) => {
    if (verdict === "Credible") {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#639922", "#97C459", "#EAF3DE", "#1D9E75", "#ffffff"],
      });
    } else if (verdict === "Likely Credible") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#1D9E75", "#5DCAA5", "#E1F5EE", "#ffffff"],
      });
    }
  };

  return { fire };
}