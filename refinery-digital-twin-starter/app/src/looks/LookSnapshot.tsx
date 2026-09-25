import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { InstancedMesh, Matrix4, Mesh, Raycaster, Vector2, Vector3 } from 'three';
import { assetAtFace, type PickRange } from '../equipmentBatches';
import { useLook } from './LookProvider';
import type { AssetRegistry } from '../data/registry';
type Snapshot = { dressing: { visible: boolean; modules: number }; optionalDetail: { meshes: string[]; visibleMeshes: number; assetIds: string[] }; registryIds: string[]; look: string; camera: { position: number[]; quaternion: number[] }; geometries: number; textures: number; meshes: { uuid: string; geometry: string; material: string[]; assetId: string | null; assetIds: string[] }[] };
declare global { interface Window { __refineryDetailHits?: () => number; __refineryLookSnapshot?: () => Snapshot; __refineryPickPoint?: (assetId: string) => { x: number; y: number } | null } }
export function LookSnapshot({ registry }: { registry: AssetRegistry }) {
  const { scene, camera, gl } = useThree();
  const { look } = useLook();
  useEffect(() => {
    if (new URLSearchParams(location.search).get('measure') !== '1') return;
    const snapshot = (): Snapshot => {
      const meshes: Snapshot['meshes'] = [];
      const detailMeshes: string[] = [], detailAssets = new Set<string>();
      let visibleDetail = 0;
      scene.traverseVisible(node => { if (node instanceof Mesh && node.userData.optionalDetail) visibleDetail++; });
      scene.traverse(node => {
        if (!(node instanceof Mesh)) return;
        if (node.userData.optionalDetail) { detailMeshes.push(node.uuid); (node.userData.assetRanges ?? []).forEach((range: PickRange) => detailAssets.add(range.asset.asset_id)); return; }
        const ranges: PickRange[] = node.userData.assetRanges ?? [];
        const assetId = node.userData.asset_id ?? null;
        meshes.push({ uuid: node.uuid, geometry: node.geometry.uuid, assetId, assetIds: [...new Set(ranges.map(range => range.asset.asset_id).concat(assetId ? [assetId] : []))], material: (Array.isArray(node.material) ? node.material : [node.material]).map(material => material.uuid) });
      });
      const dressing = scene.getObjectByName('non-canonical-slice-dressing');
      return { dressing: { visible: !!dressing?.visible, modules: dressing?.userData.moduleCount ?? 0 }, optionalDetail: { meshes: detailMeshes.sort(), visibleMeshes: visibleDetail, assetIds: [...detailAssets].sort() }, registryIds: [...registry.objects.keys()].sort(), look: look.id, camera: { position: camera.position.toArray(), quaternion: camera.quaternion.toArray() }, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, meshes };
    };
    // This locates a visible surface; the test still dispatches an actual canvas mouse click.
    const pickPoint = (assetId: string) => {
      scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
      const meshes: Mesh[] = []; scene.traverseVisible(node => { if (node instanceof Mesh) meshes.push(node); });
      const raycaster = new Raycaster(), point = new Vector3(), corner = new Vector3(), ndc = new Vector2();
      const rect = gl.domElement.getBoundingClientRect();
      for (const mesh of meshes) {
        const ranges: { start: number; count: number }[] = mesh.userData.asset_id === assetId
          ? [{ start: 0, count: mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position').count }]
          : (mesh.userData.assetRanges ?? []).filter((range: PickRange) => range.asset.asset_id === assetId);
        if (!ranges.length) continue;
        const matrix = mesh.matrixWorld.clone();
        if (mesh instanceof InstancedMesh) { const instance = new Matrix4(); mesh.getMatrixAt(0, instance); matrix.multiply(instance); }
        const positions = mesh.geometry.getAttribute('position');
        for (const range of ranges) {
          const triangles = range.count / 3, stride = Math.max(1, Math.floor(triangles / 160));
          for (let triangle = 0; triangle < triangles; triangle += stride) {
            point.set(0, 0, 0);
            for (let vertex = 0; vertex < 3; vertex++) { const index = range.start + triangle * 3 + vertex; point.add(corner.fromBufferAttribute(positions, mesh.geometry.index ? mesh.geometry.index.getX(index) : index)); }
            point.multiplyScalar(1 / 3).applyMatrix4(matrix).project(camera);
            if (Math.abs(point.x) > .98 || Math.abs(point.y) > .98 || Math.abs(point.z) > 1) continue;
            ndc.set(point.x, point.y); raycaster.setFromCamera(ndc, camera);
            const hit = raycaster.intersectObjects(meshes, false)[0];
            if (!hit || (hit.object.userData.asset_id ?? assetAtFace(hit.object.userData.assetRanges ?? [], hit.faceIndex)?.asset_id) !== assetId) continue;
            return { x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 };
          }
        }
      }
      return null;
    };
    // Probe the actual mesh raycast directly, including hidden parents, as R3F does.
    const detailHits = () => {
      scene.updateMatrixWorld(true);
      let hits = 0;
      scene.traverse(node => {
        if (!(node instanceof InstancedMesh) || !node.userData.optionalDetail) return;
        const matrix = new Matrix4(); node.getMatrixAt(0, matrix); matrix.premultiply(node.matrixWorld);
        const positions = node.geometry.getAttribute('position');
        const vertices = [0, 1, 2].map(index => new Vector3().fromBufferAttribute(positions, node.geometry.index?.getX(index) ?? index).applyMatrix4(matrix));
        const center = vertices[0].clone().add(vertices[1]).add(vertices[2]).multiplyScalar(1 / 3);
        const normal = vertices[1].clone().sub(vertices[0]).cross(vertices[2].clone().sub(vertices[0])).normalize();
        const ray = new Raycaster(center.clone().add(normal), normal.negate());
        hits += ray.intersectObject(node, false).length;
      });
      return hits;
    };
    window.__refineryLookSnapshot = snapshot; window.__refineryPickPoint = pickPoint; window.__refineryDetailHits = detailHits;
    return () => {
      if (window.__refineryLookSnapshot === snapshot) delete window.__refineryLookSnapshot;
      if (window.__refineryPickPoint === pickPoint) delete window.__refineryPickPoint;
      if (window.__refineryDetailHits === detailHits) delete window.__refineryDetailHits;
    };
  }, [scene, camera, gl, look.id, registry]);
  return null;
}
