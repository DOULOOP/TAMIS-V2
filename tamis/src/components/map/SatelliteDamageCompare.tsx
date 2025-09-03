"use client";

import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import ImageLayer from "ol/layer/Image";
import OSM from "ol/source/OSM";
import ImageStatic from "ol/source/ImageStatic";
import { transformExtent } from "ol/proj";
import "ol/ol.css";

type Mode = "swipe" | "split";

// WGS84 extent from your raster bounds
const extent4326: [number, number, number, number] = [
	36.136884, // minLon (W)
	36.200889, // minLat (S)
	36.16479,  // maxLon (E)
	36.218908, // maxLat (N)
];

const extent3857 = transformExtent(extent4326, "EPSG:4326", "EPSG:3857") as [number, number, number, number];
const [minX, minY, maxX, maxY] = extent3857;
const center3857: [number, number] = [
	(minX + maxX) / 2,
	(minY + maxY) / 2,
];

function encodePublicPath(name: string) {
	// Expect images to be placed under public/ with these filenames
	// Handles spaces safely
	return "/" + name.replace(/ /g, "%20");
}

export default function SatelliteDamageCompare() {
	const leftRef = useRef<HTMLDivElement | null>(null);
	const rightRef = useRef<HTMLDivElement | null>(null);
	const singleRef = useRef<HTMLDivElement | null>(null);

	const [mode, setMode] = useState<Mode>("swipe");
	const [swipe, setSwipe] = useState<number>(0.5); // 0..1

	// Keep references to maps and layers
	const mapSwipeRef = useRef<Map | null>(null);
	const mapLeftRef = useRef<Map | null>(null);
	const mapRightRef = useRef<Map | null>(null);

	// prerender/postrender handlers for swipe
	const preRenderRef = useRef<any>(null);
	const postRenderRef = useRef<any>(null);

	useEffect(() => {
		if (mode === "swipe" && singleRef.current) {
			// Base and two image layers in one map
			const base = new TileLayer({ source: new OSM() });

			const layer2015 = new ImageLayer({
				source: new ImageStatic({
					url: encodePublicPath("HATAY-MERKEZ-2-2015.jpg"),
					imageExtent: extent3857,
					projection: "EPSG:3857",
				}),
			});
			const layer2023 = new ImageLayer({
				source: new ImageStatic({
					url: encodePublicPath("HATAY-MERKEZ-2-2023.jpg"),
					imageExtent: extent3857,
					projection: "EPSG:3857",
				}),
			});

			// Clip the 2023 layer according to swipe ratio
			const preRender = (e: any) => {
				const ctx: CanvasRenderingContext2D | undefined = e.context;
				if (!ctx) return;
				const width = ctx.canvas.width * swipe;
				ctx.save();
				ctx.beginPath();
				ctx.rect(0, 0, width, ctx.canvas.height);
				ctx.clip();
			};
			const postRender = (e: any) => {
				const ctx: CanvasRenderingContext2D | undefined = e.context;
				if (!ctx) return;
				ctx.restore();
			};
			preRenderRef.current = preRender;
			postRenderRef.current = postRender;
			layer2023.on("prerender", preRender);
			layer2023.on("postrender", postRender);

					const view = new View({
				projection: "EPSG:3857",
						center: center3857,
				zoom: 15,
			});

			const map = new Map({
				target: singleRef.current,
				layers: [base, layer2015, layer2023],
				view,
			});

			// Fit to imagery extent
			view.fit(extent3857, { padding: [20, 20, 20, 20], duration: 0, maxZoom: 19 });

			mapSwipeRef.current = map;

			return () => {
				layer2023.un("prerender", preRender);
				layer2023.un("postrender", postRender);
				map.setTarget(undefined);
				mapSwipeRef.current = null;
			};
		}

		if (mode === "split" && leftRef.current && rightRef.current) {
			// Shared view for synchronization
					const view = new View({
				projection: "EPSG:3857",
						center: center3857,
				zoom: 15,
			});

			// Left map (2015)
			const left = new Map({
				target: leftRef.current,
				layers: [
					new TileLayer({ source: new OSM() }),
					new ImageLayer({
						source: new ImageStatic({
							url: encodePublicPath("HATAY-MERKEZ-2-2015.jpg"),
							imageExtent: extent3857,
							projection: "EPSG:3857",
						}),
					}),
				],
				view,
			});

			// Right map (2023)
			const right = new Map({
				target: rightRef.current,
				layers: [
					new TileLayer({ source: new OSM() }),
					new ImageLayer({
						source: new ImageStatic({
							url: encodePublicPath("HATAY-MERKEZ-2-2023.jpg"),
							imageExtent: extent3857,
							projection: "EPSG:3857",
						}),
					}),
				],
				view,
			});

			// Fit once
			view.fit(extent3857, { padding: [20, 20, 20, 20], duration: 0, maxZoom: 19 });

			mapLeftRef.current = left;
			mapRightRef.current = right;

			return () => {
				left.setTarget(undefined);
				right.setTarget(undefined);
				mapLeftRef.current = null;
				mapRightRef.current = null;
			};
		}
	}, [mode]);

	// Update swipe clipping when slider changes
	useEffect(() => {
		if (mode !== "swipe") return;
		const map = mapSwipeRef.current;
		if (!map) return;
		// Re-render to apply new clip
		map.render();
	}, [swipe, mode]);

	return (
		<div className="space-y-3">
			{/* Controls */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex gap-2">
					<button
						className={`px-3 py-2 rounded-lg border text-sm ${mode === "swipe" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
						onClick={() => setMode("swipe")}
					>
						Kaydırıcı Görünüm
					</button>
					<button
						className={`px-3 py-2 rounded-lg border text-sm ${mode === "split" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
						onClick={() => setMode("split")}
					>
						Bölünmüş Görünüm
					</button>
				</div>
				{mode === "swipe" && (
					<div className="flex items-center gap-3">
						<span className="text-sm text-gray-600">2015</span>
						<input
							type="range"
							min={0}
							max={100}
							value={Math.round(swipe * 100)}
							onChange={(e) => setSwipe(Number(e.target.value) / 100)}
							className="w-64"
						/>
						<span className="text-sm text-gray-600">2023</span>
					</div>
				)}
			</div>

			{mode === "swipe" ? (
				<div ref={singleRef} className="w-full h-[70vh] rounded-xl overflow-hidden shadow" />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div className="relative">
						<div className="absolute z-10 top-2 left-2 bg-white/80 text-xs px-2 py-1 rounded border">2015</div>
						<div ref={leftRef} className="w-full h-[70vh] rounded-xl overflow-hidden shadow" />
					</div>
					<div className="relative">
						<div className="absolute z-10 top-2 left-2 bg-white/80 text-xs px-2 py-1 rounded border">2023</div>
						<div ref={rightRef} className="w-full h-[70vh] rounded-xl overflow-hidden shadow" />
					</div>
				</div>
			)}

			<p className="text-xs text-gray-500">Görüntü yolları: public/HATAY MERKEZ-2 2015.jpg ve public/HATAY MERKEZ-2 2023.jpg</p>
		</div>
	);
}

