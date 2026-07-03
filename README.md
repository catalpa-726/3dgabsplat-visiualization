# 3DGS Gaussian/Gabor Primitive Viewer

This is a small local viewer for multiple anisotropic 3D Gaussian ellipsoids, each with an optional 3DGabSplat-style Gabor modulation layer.

```text
Sigma = R(q) S S^T R(q)^T
P(x) = G(x) * (1 - sum_i w_i + sum_i w_i * cos(2*pi*f_i^T*x))
Sigma_2D = top-left-2x2(J W Sigma W^T J^T)
```

`q = (qw, qx, qy, qz)` is each primitive's rotation quaternion. The app normalizes `q`, converts it to `R(q)`, and uses `S = diag(sx, sy, sz)` for per-axis scale. The rendered ellipsoid is the selected sigma-level contour of that primitive's Gaussian covariance.

The Gabor layer follows the 3DGabSplat primitive form: a Gaussian envelope plus `F` weighted directional frequency responses. Each primitive opens with `F = 0`, which is the pure Gaussian case. Increasing `F` adds editable Gabor kernels with:

- `w`: the Gabor kernel weight.
- `fx`, `fy`, `fz`: the 3D frequency vector in the ellipsoid local coordinate frame.

The screen plane uses a 3DGS-style projection model. The screen controls describe a virtual camera pose: `screen.position` is the camera position, `screen.quaternion` is the camera/image-plane orientation, and the visible image plane is placed one focal length in front of that camera. For each primitive, the app computes `Sigma' = J W Sigma W^T J^T` and displays the top-left 2x2 covariance on the plane. For Gabor splats, each local frequency is rotated by the primitive quaternion into world space, projected with `(J W)^(-T)`, and reduced to 2D with the integration term from 3DGabSplat:

```text
f_2D.x = f_proj.x - S02 / S22 * f_proj.z
f_2D.y = f_proj.y - S12 / S22 * f_proj.z
```

Here `S = inverse(Sigma')` is the precision matrix in ray space.

Each projected splat is clipped to its finite raster footprint. The app converts `Sigma_2D` to pixel units using the editable screen resolution and only colors the splat/Gabor modulation inside `q = d^T Sigma_2D^-1 d <= 9`. Multiple splats are composited from far to near using the screen camera-space depth of each primitive center. Optional overlays can show `q=1` / `q=4` reference contours and the axis-aligned 3-sigma pixel bounding box; both are off by default so the projection opens as a natural splat. The projected alpha follows the primitive opacity slider and the screen plane opacity is controlled separately.

The projection preview/export panel rasterizes the current screen-space result into a 2D canvas using the editable `PxW` and `PxH` resolution. `Refresh Preview` updates the flat image in the panel; `Export PNG` writes the same rasterized projection to a PNG file and leaves a `Save PNG` link below the preview. The transparent-background toggle controls whether empty pixels are exported with alpha or a dark inspection background.

## Run

Use the requested conda environment:

```bat
cd /d F:\others\codex_daily\lingsui\3dgs
run_learning.bat
```

Or run it directly:

```bat
cd /d F:\others\codex_daily\lingsui\3dgs
set PYTHONHASHSEED=0
C:\Users\catalpa\.conda\envs\learning\python.exe server.py --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000/
```

The app has two control paths:

- Parameter panel: add, duplicate, delete, and select primitives; edit position, scale, quaternion rotation, opacity, color, display mode, sigma contour, Gabor parameters, screen projection parameters, and export the flat projected PNG.
- Direct 3D manipulation: choose the selected primitive or Screen/Camera, switch between translate, rotate, and scale modes, then manipulate it in the viewport.

Display modes:

- Solid: opaque shaded ellipsoid for reading the full 3D shape.
- Transparent: semi-transparent ellipsoid for seeing internal axes and the center.
- Wire: wireframe contour only.
