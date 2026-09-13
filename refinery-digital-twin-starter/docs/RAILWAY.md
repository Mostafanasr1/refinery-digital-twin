# Railway deployment

Use the repository folder `refinery-digital-twin-starter` as Railway's service root. The root Dockerfile builds the React app and runs the production static server. Railway supplies PORT; the server binds to 0.0.0.0. The health check is /healthz. Generate a public domain in Railway's Networking settings after deployment.

The Docker build deliberately uses the prepared canonical data in data/normalized, including models/refinery.glb and preview/{module.glb,render.png,manifest.json}. Include those files in the uploaded repository. Python and Blender are authoring tools and are not needed in the production container. Run npm run normalize locally before deployment when editing source data.

Local production verification:

    npm run check
    npm run test:production
    npm start

Then open http://localhost:3000/ and http://localhost:3000/#preview.

The production server serves only app/dist, sets JavaScript/JSON/GLB MIME types, and returns 404 for absent files rather than returning HTML for a missing model. Hash-based tabs need no SPA rewrite rule.

WebGL is required for interactive 3D. The cinematic render is available without WebGL. Hosting cannot enable hardware acceleration on a visitor's device.

Review limitation: the production server was exercised locally, but Docker was not available in the review environment, so the image still requires its first build on Railway. The earlier Netlify connection timeout was not demonstrated to originate in application code.
