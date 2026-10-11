import { lossFunctions } from "../functions";
import type { Step, VizModule } from "../types";
import { b } from "../types";
import type { PlotState, Point } from "../views";

const round = (x: number, d = 3) => Number(x.toFixed(d));

/* ------------------------------------------------------------------ */
/* Gradient descent                                                    */
/* ------------------------------------------------------------------ */

type GDModel = { fn: string; x0: number };

const gd: VizModule<GDModel, PlotState> = {
  slug: "gradient-descent",
  title: b("Gradient descent", "Hạ gradient"),
  short: b("Roll downhill: step against the slope to minimise a loss.", "Lăn xuống dốc: bước ngược độ dốc để cực tiểu hoá hàm mất mát."),
  category: "ml",
  tags: ["optimisation", "learning rate", "momentum", "training"],
  intro: b(
    "Training almost every ML model — from linear regression to GPT — means minimising a loss function. Gradient descent repeatedly moves the parameter a small step opposite to the derivative: x ← x − η·f′(x). The learning rate η decides everything: too small crawls, too large overshoots or explodes. Momentum adds a ‘velocity’ that rolls through small bumps.",
    "Huấn luyện hầu hết mô hình học máy — từ hồi quy tuyến tính đến GPT — là cực tiểu hoá hàm mất mát. Hạ gradient liên tục dịch tham số một bước nhỏ ngược đạo hàm: x ← x − η·f′(x). Tốc độ học η quyết định tất cả: quá nhỏ thì bò chậm, quá lớn thì vượt quá hoặc bùng nổ. Momentum thêm “vận tốc” để lăn qua các gờ nhỏ.",
  ),
  invariant: b("For a small enough η, every step lowers the loss: f(x − η f′(x)) ≈ f(x) − η f′(x)² ≤ f(x).", "Với η đủ nhỏ, mỗi bước làm giảm mất mát: f(x − η f′(x)) ≈ f(x) − η f′(x)² ≤ f(x)."),
  complexity: [
    { label: b("Cost per step", "Chi phí mỗi bước"), value: "one gradient" },
    { label: b("Convex, smooth", "Lồi, trơn"), value: "O(1/ε) steps" },
    { label: b("Non-convex", "Không lồi"), value: "local minima" },
  ],
  applications: [
    { title: b("Neural networks", "Mạng nơ-ron"), body: b("Backpropagation computes gradients; SGD/Adam (gradient descent variants) update billions of weights.", "Lan truyền ngược tính gradient; SGD/Adam (biến thể hạ gradient) cập nhật hàng tỷ trọng số.") },
    { title: b("Recommendation systems", "Hệ thống gợi ý"), body: b("Matrix factorisation for Netflix-style ratings is fitted with stochastic gradient descent.", "Phân rã ma trận cho đánh giá kiểu Netflix được khớp bằng hạ gradient ngẫu nhiên.") },
    { title: b("Logistic regression", "Hồi quy logistic"), body: b("Spam filters and click-through prediction minimise cross-entropy with gradient steps.", "Lọc thư rác và dự đoán tỷ lệ nhấp cực tiểu hoá cross-entropy bằng các bước gradient.") },
    { title: b("Engineering & finance", "Kỹ thuật & tài chính"), body: b("Calibrating physical or pricing models to data, robot control, portfolio optimisation.", "Hiệu chỉnh mô hình vật lý hoặc định giá theo dữ liệu, điều khiển robot, tối ưu danh mục.") },
  ],
  recognize: [
    b("You can compute (or auto-differentiate) the loss and its gradient.", "Bạn tính được (hoặc tự động vi phân) hàm mất mát và gradient."),
    b("No closed-form solution, or the closed form is too expensive (huge n).", "Không có lời giải dạng đóng, hoặc dạng đóng quá tốn kém (n rất lớn)."),
  ],
  pitfalls: [
    b("Learning rate too high → divergence (loss shoots up, NaNs). Try η = 2.1 on the bowl.", "Tốc độ học quá cao → phân kỳ (mất mát tăng vọt, NaN). Thử η = 2.1 trên hàm bát."),
    b("Non-convex losses trap plain GD in local minima — try the wavy function from x₀ = 6.", "Hàm mất mát không lồi khiến GD thường kẹt ở cực tiểu địa phương — thử hàm gợn sóng từ x₀ = 6."),
    b("Unscaled features make the landscape a narrow valley; standardise inputs.", "Đặc trưng chưa chuẩn hoá khiến bề mặt thành thung lũng hẹp; hãy chuẩn hoá đầu vào."),
  ],
  practice: [
    { name: "Andrew Ng — Gradient descent (Coursera)", url: "https://www.coursera.org/learn/machine-learning", level: "Easy" },
    { name: "Distill — Why Momentum Really Works", url: "https://distill.pub/2017/momentum/", level: "Medium" },
    { name: "Sebastian Ruder — Overview of GD optimisers", url: "https://www.ruder.io/optimizing-gradient-descent/", level: "Medium" },
  ],
  python: `def gradient_descent(df, x, lr=0.1, steps=50, momentum=0.0):
    v = 0.0
    for _ in range(steps):
        v = momentum * v - lr * df(x)
        x = x + v
    return x

# f(x) = x^2 / 2  →  f'(x) = x
print(gradient_descent(lambda x: x, x=8.0))   # → close to 0`,
  quiz: [
    {
      q: b("On f(x) = ½x² (f′(x) = x), which learning rate makes GD diverge?", "Trên f(x) = ½x² (f′(x) = x), tốc độ học nào khiến GD phân kỳ?"),
      options: [b("0.5", "0.5"), b("1.0", "1.0"), b("2.5", "2.5")],
      answer: 2,
      why: b("x ← (1 − η)x; |1 − η| > 1 when η > 2, so |x| grows each step.", "x ← (1 − η)x; |1 − η| > 1 khi η > 2, nên |x| tăng mỗi bước."),
    },
    {
      q: b("What does momentum help with?", "Momentum giúp gì?"),
      options: [b("Escaping shallow local minima and speeding through flat regions", "Thoát cực tiểu địa phương nông và đi nhanh qua vùng phẳng"), b("Computing exact gradients", "Tính gradient chính xác"), b("Reducing memory", "Giảm bộ nhớ")],
      answer: 0,
      why: b("Accumulated velocity carries the parameter past small bumps.", "Vận tốc tích luỹ đưa tham số vượt qua các gờ nhỏ."),
    },
  ],
  view: "plot",
  initial: () => ({ fn: "wavy", x0: 8 }),
  idle: (m) => ({ kind: "curve", fn: m.fn, path: [{ x: m.x0, y: lossFunctions[m.fn].f(m.x0) }], loss: [] }),
  actions: [
    {
      id: "run",
      label: b("Run", "Chạy"),
      fields: [
        { key: "fn", label: b("Loss function", "Hàm mất mát"), kind: "select", default: "wavy", options: [{ value: "bowl", label: b("Bowl ½x² (convex)", "Bát ½x² (lồi)") }, { value: "wavy", label: b("Wavy (local minima)", "Gợn sóng (cực tiểu địa phương)") }, { value: "ravine", label: b("Flat plateau", "Cao nguyên phẳng") }] },
        { key: "x0", label: b("Start x₀", "Điểm đầu x₀"), kind: "number", default: 8, min: -10, max: 10 },
        { key: "lr", label: b("Learning rate η", "Tốc độ học η"), kind: "list", default: "0.3" },
        { key: "momentum", label: b("Momentum β", "Momentum β"), kind: "list", default: "0" },
        { key: "steps", label: b("Steps", "Số bước"), kind: "number", default: 25, min: 1, max: 60 },
      ],
      code: ["x = x₀; v = 0", "repeat steps times", "  g = f'(x)        // slope", "  v = β·v − η·g    // β=0: plain GD", "  x = x + v", "return x"],
      run(_m, val) {
        const fn = lossFunctions[val.fn] ? val.fn : "bowl";
        const F = lossFunctions[fn];
        const lr = Number(val.lr), beta = Number(val.momentum);
        let x = Math.max(-10, Math.min(10, Number(val.x0)));
        const n = Math.max(1, Math.min(60, Number(val.steps) || 25));
        if (!(lr > 0 && lr <= 5)) return { error: b("Learning rate must be between 0 and 5.", "Tốc độ học phải trong khoảng 0 đến 5.") };
        if (!(beta >= 0 && beta < 1)) return { error: b("Momentum must be in [0, 1).", "Momentum phải trong [0, 1).") };
        const steps: Step<PlotState>[] = [];
        const path = [{ x, y: F.f(x) }];
        const loss = [F.f(x)];
        let v = 0;
        const snap = (line: number | number[], note: ReturnType<typeof b>, tangent: boolean, vars: Record<string, string | number>) =>
          steps.push({ state: { kind: "curve", fn, path: path.slice(), tangent: tangent ? { x, slope: F.df(x) } : null, loss: loss.slice() }, line, note, vars });
        snap(0, b(`Start at x = ${round(x)} with loss ${round(F.f(x))}.`, `Bắt đầu tại x = ${round(x)} với mất mát ${round(F.f(x))}.`), true, { x: round(x), "f(x)": round(F.f(x)) });
        for (let i = 1; i <= n; i++) {
          const g = F.df(x);
          snap([1, 2], b(`Step ${i}: slope f′(${round(x)}) = ${round(g)} — ${g > 0 ? "downhill is to the left" : g < 0 ? "downhill is to the right" : "flat"}.`, `Bước ${i}: độ dốc f′(${round(x)}) = ${round(g)} — ${g > 0 ? "xuống dốc ở bên trái" : g < 0 ? "xuống dốc ở bên phải" : "phẳng"}.`), true, { step: i, x: round(x), "f'(x)": round(g), v: round(v) });
          v = beta * v - lr * g;
          x = x + v;
          if (!Number.isFinite(x) || Math.abs(x) > 1e6) {
            snap(4, b("x exploded to infinity — the learning rate is too large. This is divergence.", "x bùng nổ ra vô cực — tốc độ học quá lớn. Đây là phân kỳ."), false, { step: i });
            break;
          }
          path.push({ x, y: F.f(x) });
          loss.push(F.f(x));
          const up = loss[loss.length - 1] > loss[loss.length - 2];
          snap([3, 4], up
            ? b(`Moved to x = ${round(x)}, but the loss went UP to ${round(F.f(x))} — overshoot!`, `Dịch tới x = ${round(x)}, nhưng mất mát TĂNG lên ${round(F.f(x))} — vượt quá!`)
            : b(`Moved by ${round(v)} to x = ${round(x)}; loss ${round(F.f(x))}.`, `Dịch ${round(v)} tới x = ${round(x)}; mất mát ${round(F.f(x))}.`), false, { step: i, x: round(x), "f(x)": round(F.f(x)), v: round(v) });
          if (Math.abs(v) < 1e-4 && Math.abs(F.df(x)) < 1e-3) {
            snap(5, b(`Converged: the gradient is ~0 at x = ${round(x)}.`, `Đã hội tụ: gradient ≈ 0 tại x = ${round(x)}.`), true, { step: i, x: round(x) });
            break;
          }
        }
        const end = path[path.length - 1];
        snap(5, b(`Finished at x = ${round(end.x)}, loss = ${round(end.y)}. Try a different η, start point or momentum and compare.`, `Kết thúc tại x = ${round(end.x)}, mất mát = ${round(end.y)}. Hãy thử η, điểm đầu hoặc momentum khác để so sánh.`), false, { x: round(end.x) });
        return { steps, model: { fn, x0: Number(val.x0) } };
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Linear regression                                                   */
/* ------------------------------------------------------------------ */

type LRModel = { points: Point[] };

const genLine = (n = 18): Point[] => {
  const m = 0.4 + Math.random() * 0.8, c = 1 + Math.random() * 2;
  return Array.from({ length: n }, () => {
    const x = Math.random() * 10;
    return { x: round(x, 2), y: round(Math.max(0, Math.min(10, m * x + c + (Math.random() - 0.5) * 2.4)), 2) };
  });
};

const mse = (pts: Point[], m: number, c: number) => pts.reduce((s, p) => s + (m * p.x + c - p.y) ** 2, 0) / pts.length;

const linreg: VizModule<LRModel, PlotState> = {
  slug: "linear-regression",
  title: b("Linear regression", "Hồi quy tuyến tính"),
  short: b("Fit the best straight line by minimising squared error.", "Khớp đường thẳng tốt nhất bằng cách cực tiểu hoá sai số bình phương."),
  category: "ml",
  tags: ["supervised", "MSE", "gradient descent", "baseline model"],
  intro: b(
    "Linear regression predicts ŷ = w·x + b. ‘Best’ means the smallest mean squared error between predictions and the data. Here we learn w and b with gradient descent: compute how the error changes with each parameter, nudge both downhill, repeat. The dashed red lines are the residuals the model is trying to shrink.",
    "Hồi quy tuyến tính dự đoán ŷ = w·x + b. “Tốt nhất” nghĩa là sai số bình phương trung bình nhỏ nhất giữa dự đoán và dữ liệu. Ở đây ta học w và b bằng hạ gradient: tính sai số thay đổi thế nào theo từng tham số, đẩy cả hai xuống dốc, lặp lại. Các đường đứt đỏ là phần dư mà mô hình đang cố thu nhỏ.",
  ),
  invariant: b("MSE is convex in (w, b), so gradient descent with a small enough rate always approaches the single global minimum.", "MSE lồi theo (w, b), nên hạ gradient với tốc độ đủ nhỏ luôn tiến về cực tiểu toàn cục duy nhất."),
  complexity: [
    { label: b("One GD epoch", "Một epoch GD"), value: "O(n · d)" },
    { label: b("Closed form", "Dạng đóng"), value: "O(n·d² + d³)" },
    { label: b("Prediction", "Dự đoán"), value: "O(d)" },
  ],
  applications: [
    { title: b("Forecasting", "Dự báo"), body: b("Sales vs ad spend, house price vs size, energy demand vs temperature.", "Doanh số theo chi phí quảng cáo, giá nhà theo diện tích, nhu cầu điện theo nhiệt độ.") },
    { title: b("A/B tests & science", "A/B test & khoa học"), body: b("Estimating effect sizes while controlling for other variables.", "Ước lượng mức độ ảnh hưởng trong khi kiểm soát các biến khác.") },
    { title: b("The neuron", "Nơ-ron"), body: b("Each neuron in a neural network computes w·x + b before its activation — this is the building block.", "Mỗi nơ-ron trong mạng tính w·x + b trước hàm kích hoạt — đây là viên gạch nền.") },
  ],
  recognize: [
    b("Predict a continuous number from features with a roughly linear trend.", "Dự đoán một số liên tục từ đặc trưng có xu hướng gần tuyến tính."),
    b("You need an interpretable baseline before trying complex models.", "Cần một mô hình nền dễ giải thích trước khi thử mô hình phức tạp."),
  ],
  pitfalls: [
    b("Outliers dominate squared error — consider Huber loss or robust regression.", "Ngoại lệ chi phối sai số bình phương — cân nhắc hàm mất mát Huber hoặc hồi quy bền vững."),
    b("Correlation is not causation; a good fit does not explain why.", "Tương quan không phải nhân quả; khớp tốt không giải thích được vì sao."),
    b("Extrapolating far outside the training range is unreliable.", "Ngoại suy xa ngoài miền dữ liệu huấn luyện không đáng tin."),
  ],
  practice: [
    { name: "scikit-learn LinearRegression", url: "https://scikit-learn.org/stable/modules/linear_model.html", level: "Easy" },
    { name: "Kaggle — House Prices", url: "https://www.kaggle.com/c/house-prices-advanced-regression-techniques", level: "Medium" },
  ],
  python: `def fit_line(xs, ys, lr=0.02, epochs=300):
    w = b = 0.0
    n = len(xs)
    for _ in range(epochs):
        dw = sum(2 * (w * x + b - y) * x for x, y in zip(xs, ys)) / n
        db = sum(2 * (w * x + b - y) for x, y in zip(xs, ys)) / n
        w -= lr * dw
        b -= lr * db
    return w, b`,
  quiz: [
    {
      q: b("Why square the residuals instead of summing them?", "Vì sao bình phương phần dư thay vì cộng chúng lại?"),
      options: [b("Positive and negative errors would cancel out", "Sai số dương và âm sẽ triệt tiêu nhau"), b("Squares are faster", "Bình phương nhanh hơn"), b("Tradition only", "Chỉ là truyền thống")],
      answer: 0,
      why: b("Squaring also makes the loss smooth and convex.", "Bình phương còn làm hàm mất mát trơn và lồi."),
    },
  ],
  view: "plot",
  initial: () => ({ points: genLine() }),
  idle: (m) => ({ kind: "scatter", points: m.points, line: null, loss: [] }),
  actions: [
    {
      id: "data",
      label: b("New data", "Dữ liệu mới"),
      fields: [{ key: "n", label: b("Points", "Số điểm"), kind: "number", default: 18, min: 4, max: 40 }],
      run(_m, v) {
        const points = genLine(Math.max(4, Math.min(40, Number(v.n) || 18)));
        return { model: { points }, steps: [{ state: { kind: "scatter", points, line: null, loss: [] }, line: -1, note: b(`Generated ${points.length} noisy points around a hidden line.`, `Đã tạo ${points.length} điểm nhiễu quanh một đường thẳng ẩn.`) }] };
      },
    },
    {
      id: "fit",
      label: b("Fit with GD", "Khớp bằng GD"),
      fields: [
        { key: "lr", label: b("Learning rate η", "Tốc độ học η"), kind: "list", default: "0.02" },
        { key: "epochs", label: b("Epochs", "Số epoch"), kind: "number", default: 40, min: 1, max: 120 },
      ],
      code: ["w = 0; b = 0", "repeat epochs times", "  ŷᵢ = w·xᵢ + b; errᵢ = ŷᵢ − yᵢ", "  ∂w = (2/n)·Σ errᵢ·xᵢ;  ∂b = (2/n)·Σ errᵢ", "  w −= η·∂w;  b −= η·∂b"],
      run(m, v) {
        const lr = Number(v.lr);
        const E = Math.max(1, Math.min(120, Number(v.epochs) || 40));
        if (!(lr > 0 && lr < 1)) return { error: b("Use a learning rate between 0 and 1 (try 0.02).", "Dùng tốc độ học trong khoảng 0 đến 1 (thử 0.02).") };
        const pts = m.points;
        let w = 0, c = 0;
        const loss: number[] = [mse(pts, w, c)];
        const steps: Step<PlotState>[] = [];
        const snap = (line: number | number[], note: ReturnType<typeof b>, vars: Record<string, string | number>) =>
          steps.push({ state: { kind: "scatter", points: pts, line: { m: w, b: c }, residuals: true, loss: loss.slice() }, line, note, vars });
        snap(0, b(`Start with a flat line: w = 0, b = 0. MSE = ${round(loss[0])}.`, `Bắt đầu với đường nằm ngang: w = 0, b = 0. MSE = ${round(loss[0])}.`), { w: 0, b: 0, MSE: round(loss[0]) });
        for (let e = 1; e <= E; e++) {
          let dw = 0, db = 0;
          for (const p of pts) { const err = w * p.x + c - p.y; dw += err * p.x; db += err; }
          dw = (2 * dw) / pts.length; db = (2 * db) / pts.length;
          w -= lr * dw; c -= lr * db;
          const L = mse(pts, w, c);
          loss.push(L);
          if (!Number.isFinite(L) || L > 1e6) {
            snap(4, b("The loss exploded — learning rate too high for this data scale.", "Mất mát bùng nổ — tốc độ học quá cao với thang dữ liệu này."), { epoch: e });
            return { steps, model: m };
          }
          if (e <= 5 || e % Math.ceil(E / 25) === 0 || e === E)
            snap([2, 3, 4], b(`Epoch ${e}: ∂w = ${round(dw)}, ∂b = ${round(db)} → w = ${round(w)}, b = ${round(c)}. MSE = ${round(L)}.`, `Epoch ${e}: ∂w = ${round(dw)}, ∂b = ${round(db)} → w = ${round(w)}, b = ${round(c)}. MSE = ${round(L)}.`), { epoch: e, w: round(w), b: round(c), MSE: round(L) });
        }
        snap(-1, b(`Learned ŷ = ${round(w, 2)}·x + ${round(c, 2)} with MSE ${round(loss[loss.length - 1])}. More epochs or a larger η get closer to the optimum.`, `Đã học ŷ = ${round(w, 2)}·x + ${round(c, 2)} với MSE ${round(loss[loss.length - 1])}. Thêm epoch hoặc η lớn hơn sẽ gần tối ưu hơn.`), { w: round(w), b: round(c) });
        return { steps, model: m };
      },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* k-means                                                             */
/* ------------------------------------------------------------------ */

type KMModel = { points: Point[] };

const blobs = (k: number, per: number): Point[] => {
  const centres = Array.from({ length: k }, () => ({ x: 1.5 + Math.random() * 7, y: 1.5 + Math.random() * 7 }));
  return centres.flatMap((c) =>
    Array.from({ length: per }, () => {
      const r = Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * 0.7, a = Math.random() * 2 * Math.PI;
      return { x: round(Math.max(0.2, Math.min(9.8, c.x + r * Math.cos(a))), 2), y: round(Math.max(0.2, Math.min(9.8, c.y + r * Math.sin(a))), 2) };
    }),
  );
};

const d2 = (a: Point, c: Point) => (a.x - c.x) ** 2 + (a.y - c.y) ** 2;

const kmeans: VizModule<KMModel, PlotState> = {
  slug: "k-means",
  title: b("k-means clustering", "Phân cụm k-means"),
  short: b("Alternate between assigning points and moving centroids.", "Luân phiên gán điểm và dịch chuyển tâm cụm."),
  category: "ml",
  tags: ["unsupervised", "clustering", "Lloyd's algorithm", "O(n·k) per step"],
  intro: b(
    "k-means splits unlabeled points into k groups. Start with k centroids, then repeat two steps until nothing changes: (1) assign every point to its nearest centroid, (2) move each centroid to the mean of its points. Each step can only lower the total squared distance (inertia), so it always converges — though not always to the best clustering.",
    "k-means chia các điểm chưa gán nhãn thành k nhóm. Bắt đầu với k tâm, rồi lặp hai bước đến khi không đổi: (1) gán mỗi điểm cho tâm gần nhất, (2) dời mỗi tâm về trung bình các điểm của nó. Mỗi bước chỉ có thể làm giảm tổng bình phương khoảng cách (inertia), nên luôn hội tụ — dù không phải lúc nào cũng tới cách phân cụm tốt nhất.",
  ),
  invariant: b("Inertia Σ‖xᵢ − μ_{c(i)}‖² never increases, in either the assign step or the update step.", "Inertia Σ‖xᵢ − μ_{c(i)}‖² không bao giờ tăng, ở cả bước gán lẫn bước cập nhật."),
  complexity: [
    { label: b("One iteration", "Một vòng lặp"), value: "O(n · k · d)" },
    { label: b("Iterations", "Số vòng"), value: "usually < 50" },
    { label: b("Space", "Bộ nhớ"), value: "O(n + k)" },
  ],
  applications: [
    { title: b("Customer segmentation", "Phân khúc khách hàng"), body: b("Group shoppers by spending patterns to tailor marketing.", "Nhóm người mua theo thói quen chi tiêu để cá nhân hoá tiếp thị.") },
    { title: b("Image compression", "Nén ảnh"), body: b("Cluster pixel colours into k = 16 centroids and repaint each pixel with its centroid (colour quantisation).", "Phân cụm màu điểm ảnh thành k = 16 tâm và tô lại mỗi điểm bằng màu tâm (lượng tử hoá màu).") },
    { title: b("Vector search", "Tìm kiếm vector"), body: b("FAISS and other ANN indexes use k-means to partition embedding space so queries only search nearby cells.", "FAISS và các chỉ mục ANN khác dùng k-means để chia không gian embedding, truy vấn chỉ tìm ở ô gần.") },
    { title: b("Anomaly detection", "Phát hiện bất thường"), body: b("Points far from every centroid are suspicious (fraud, faulty sensors).", "Điểm xa mọi tâm là đáng ngờ (gian lận, cảm biến hỏng).") },
  ],
  recognize: [
    b("No labels, and you want k roughly round, similar-size groups.", "Không có nhãn, và bạn muốn k nhóm tròn, kích thước tương đương."),
  ],
  pitfalls: [
    b("Results depend on initialisation — run several times or use k-means++.", "Kết quả phụ thuộc khởi tạo — chạy nhiều lần hoặc dùng k-means++."),
    b("You must choose k (try the elbow method or silhouette score).", "Phải tự chọn k (thử phương pháp khuỷu tay hoặc chỉ số silhouette)."),
    b("Fails on elongated or nested clusters; scale features first.", "Thất bại với cụm dài hoặc lồng nhau; hãy chuẩn hoá đặc trưng trước."),
  ],
  practice: [
    { name: "scikit-learn KMeans", url: "https://scikit-learn.org/stable/modules/clustering.html#k-means", level: "Easy" },
    { name: "Stanford CS229 — k-means notes", url: "https://cs229.stanford.edu/notes2020spring/cs229-notes7a.pdf", level: "Medium" },
  ],
  python: `import random

def kmeans(points, k, iters=100):
    cents = random.sample(points, k)
    for _ in range(iters):
        groups = [[] for _ in range(k)]
        for p in points:                       # assign
            i = min(range(k), key=lambda c: (p[0]-cents[c][0])**2 + (p[1]-cents[c][1])**2)
            groups[i].append(p)
        new = [(sum(x for x, _ in g)/len(g), sum(y for _, y in g)/len(g)) if g else cents[i]
               for i, g in enumerate(groups)]  # update
        if new == cents:
            break
        cents = new
    return cents, groups`,
  quiz: [
    {
      q: b("k-means always converges. Does it always find the best clustering?", "k-means luôn hội tụ. Nó có luôn tìm được cách phân cụm tốt nhất không?"),
      options: [b("Yes", "Có"), b("No — it can stop at a local optimum", "Không — có thể dừng ở tối ưu địa phương")],
      answer: 1,
      why: b("Bad initial centroids lead to poor but stable solutions.", "Tâm khởi tạo kém dẫn tới lời giải kém nhưng ổn định."),
    },
  ],
  view: "plot",
  initial: () => ({ points: blobs(3, 14) }),
  idle: (m) => ({ kind: "scatter", points: m.points, loss: [] }),
  actions: [
    {
      id: "data",
      label: b("New data", "Dữ liệu mới"),
      fields: [{ key: "blobs", label: b("True clusters", "Số cụm thật"), kind: "number", default: 3, min: 2, max: 6 }],
      run(_m, v) {
        const points = blobs(Math.max(2, Math.min(6, Number(v.blobs) || 3)), 14);
        return { model: { points }, steps: [{ state: { kind: "scatter", points, loss: [] }, line: -1, note: b(`Generated ${points.length} unlabeled points.`, `Đã tạo ${points.length} điểm chưa gán nhãn.`) }] };
      },
    },
    {
      id: "run",
      label: b("Cluster", "Phân cụm"),
      fields: [
        { key: "k", label: b("k", "k"), kind: "number", default: 3, min: 1, max: 6 },
        { key: "init", label: b("Initialisation", "Khởi tạo"), kind: "select", default: "random", options: [{ value: "random", label: b("Random points", "Điểm ngẫu nhiên") }, { value: "pp", label: b("k-means++", "k-means++") }] },
      ],
      code: ["pick k initial centroids", "repeat", "  assign each point to its nearest centroid", "  move each centroid to the mean of its points", "until no assignment changes"],
      run(m, v) {
        const K = Math.max(1, Math.min(6, Number(v.k) || 3));
        const pts = m.points.map((p) => ({ ...p, c: undefined as number | undefined }));
        if (pts.length < K) return { error: b("Need at least k points.", "Cần ít nhất k điểm.") };
        let cents: Point[] = [];
        if (v.init === "pp") {
          cents.push({ ...pts[Math.floor(Math.random() * pts.length)] });
          while (cents.length < K) {
            const ds = pts.map((p) => Math.min(...cents.map((c) => d2(p, c))));
            let r = Math.random() * ds.reduce((s, x) => s + x, 0);
            let idx = 0;
            while (r > ds[idx] && idx < pts.length - 1) { r -= ds[idx]; idx++; }
            cents.push({ ...pts[idx] });
          }
        } else {
          const pool = pts.slice().sort(() => Math.random() - 0.5);
          cents = pool.slice(0, K).map((p) => ({ x: p.x, y: p.y }));
        }
        cents = cents.map((c, i) => ({ x: c.x, y: c.y, c: i }));
        const trails: Point[][] = cents.map((c) => [{ ...c }]);
        const loss: number[] = [];
        const steps: Step<PlotState>[] = [];
        const inertia = () => pts.reduce((s, p) => s + (p.c == null ? 0 : d2(p, cents[p.c])), 0);
        const snap = (line: number | number[], note: ReturnType<typeof b>, vars: Record<string, string | number> = {}) =>
          steps.push({ state: { kind: "scatter", points: pts.map((p) => ({ ...p })), centroids: cents.map((c) => ({ ...c })), trails: trails.map((t) => t.slice()), loss: loss.slice() }, line, note, vars });
        snap(0, v.init === "pp" ? b("k-means++: spread the initial centroids out, favouring points far from existing ones.", "k-means++: rải tâm ban đầu, ưu tiên điểm xa các tâm đã có.") : b(`Pick ${K} random points as starting centroids.`, `Chọn ${K} điểm ngẫu nhiên làm tâm ban đầu.`), { k: K });
        for (let it = 1; it <= 30; it++) {
          let changed = 0;
          for (const p of pts) {
            let best = 0;
            for (let c = 1; c < K; c++) if (d2(p, cents[c]) < d2(p, cents[best])) best = c;
            if (p.c !== best) { changed++; p.c = best; }
          }
          loss.push(inertia());
          snap(2, b(`Iteration ${it}: assign — ${changed} point(s) changed cluster. Inertia ${round(loss[loss.length - 1], 2)}.`, `Vòng ${it}: gán — ${changed} điểm đổi cụm. Inertia ${round(loss[loss.length - 1], 2)}.`), { iteration: it, changed, inertia: round(loss[loss.length - 1], 2) });
          if (!changed && it > 1) {
            snap(4, b(`No point changed cluster — converged after ${it - 1} update(s).`, `Không điểm nào đổi cụm — hội tụ sau ${it - 1} lần cập nhật.`), { iteration: it });
            break;
          }
          cents = cents.map((c, i) => {
            const mine = pts.filter((p) => p.c === i);
            if (!mine.length) return c;
            return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length, c: i };
          });
          cents.forEach((c, i) => trails[i].push({ ...c }));
          loss.push(inertia());
          snap(3, b(`Update — each centroid moves to the mean of its points. Inertia ${round(loss[loss.length - 1], 2)}.`, `Cập nhật — mỗi tâm dời về trung bình các điểm của nó. Inertia ${round(loss[loss.length - 1], 2)}.`), { iteration: it, inertia: round(loss[loss.length - 1], 2) });
        }
        return { steps, model: m };
      },
    },
  ],
};

export const mlModules = [gd, linreg, kmeans];
