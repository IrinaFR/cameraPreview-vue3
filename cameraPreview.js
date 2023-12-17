import { onMounted, onBeforeUnmount, ref } from 'vue';
import { CameraPreview } from '@capacitor-community/camera-preview';

export function useCameraPreview(options) {
	const isInited = ref(false);

	function cameraPreview_getOptions(){
		return {
			position: 'rear',
			x: 0,
			y: (options.topOffset || 0),
			// width: window.screen.width,
			// height: window.screen.height - (options.topOffset || 0) - (options.bottomOffset || 0),
			paddingBottom: options.bottomOffset || 0,
			parent: options.parentId,
			className: options.className,
			disableAudio: true,
			toBack: true,
			rotateWhenOrientationChanged: true,
			disableExifHeaderStripping: true,
			// lockAndroidOrientation: true,
		};
	}

	async function cameraPreview_startPreview() {
		try {
			await CameraPreview.start(cameraPreview_getOptions());
			isInited.value = true;
			document.body.classList.add('body-transparent');
		} catch (e) {
			console.error(e);
		}
	}

	async function cameraPreview_stopPreview() {
		if (isInited.value === false) return;
		document.body.classList.remove('body-transparent');

		try {
			await CameraPreview.stop();
		} finally {
			isInited.value = false;
		}
	}

	async function cameraPreview_capture(options) {
		const result = await CameraPreview.captureSample({
			quality: 85,
			...options,
		});

		return result.value;
	}
	async function cameraPreview_base64ToBlob(dataURI){
		const splitDataURI = dataURI.split(',')
		const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
		const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
		const ia = new Uint8Array(byteString.length)
		for (let i = 0; i < byteString.length; i++)
			ia[i] = byteString.charCodeAt(i)

		return new Blob([ia], { type: mimeString })
	}
	onMounted(() => {
		if (options.autostart) {
			cameraPreview_startPreview();
		}
	});

	onBeforeUnmount(() => {
		if (options.autostop) {
			cameraPreview_stopPreview();
		}
	});

	return {
		cameraPreview_startPreview,
		cameraPreview_stopPreview,
		cameraPreview_capture,
		cameraPreview_base64ToBlob,
		isInited,
	};
}