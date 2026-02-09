<script lang="ts">
  import { onMount } from 'svelte';
  import CanvasEditor from '$lib/components/canvas/CanvasEditor.svelte';
  import { editorStore } from '$lib/stores/editorStore.svelte';
  import { notifications } from '$lib/services/notifications';

  interface PageData {
    id: string;
    name: string;
    width: number;
    height: number;
    backgroundSrc?: string;
    objects: { id: string; type: string; [key: string]: unknown }[];
  }

  interface Props {
    data: {
      chapterId: string;
      chapterName: string;
      projectId: string;
      pages: PageData[];
    };
  }

  let { data }: Props = $props();

  onMount(() => {
    const mappedPages = data.pages.map((page, index) => ({
      id: page.id,
      name: page.name || `Page ${index + 1}`,
      width: page.width,
      height: page.height,
      imageUrl: page.backgroundSrc,
      inpaintedImageUrl: undefined,
      textBoxes: (page.objects || [])
        .filter((obj: any) => obj.type === 'i-text' || obj.type === 'textbox' || obj.type === 'text')
        .map((obj: any) => ({
          id: String(obj.id || crypto.randomUUID()),
          text: String(obj.text || ''),
          originalText: String(obj.text || ''),
          geometry: {
            x: Number(obj.left || 60),
            y: Number(obj.top || 60),
            w: Math.max(20, Number(obj.width || 280)),
            h: Math.max(20, Number(obj.height || 90)),
            rotation: Number(obj.angle || 0)
          },
          style: {
            fontSize: Number(obj.fontSize || 32),
            fontFamily: String(obj.fontFamily || 'Inter'),
            color: String(obj.fill || '#ffffff'),
            bgColor: null,
            bubbleShape: 'rounded' as const,
            lineHeight: Number(obj.lineHeight || 1.2)
          }
        }))
    }));

    editorStore.loadProject({
      id: data.chapterId,
      name: data.chapterName,
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      pages: mappedPages,
      activePageId: 0,
      selectedTextBoxId: null,
      showInpainted: true
    });

    editorStore.setAutoSaveCallback(async () => {
      try {
        const response = await fetch(`/api/project/${data.projectId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId: data.chapterId,
            pages: editorStore.pages.map((page) => ({
              id: page.id,
              name: page.name,
              width: page.width,
              height: page.height,
              backgroundSrc: page.imageUrl,
              objects: page.textBoxes.map((box) => ({
                id: box.id,
                type: 'i-text',
                text: box.text,
                left: box.geometry.x,
                top: box.geometry.y,
                width: box.geometry.w,
                height: box.geometry.h,
                angle: box.geometry.rotation,
                fontSize: box.style.fontSize,
                fontFamily: box.style.fontFamily,
                fill: box.style.color,
                lineHeight: box.style.lineHeight
              }))
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`Save failed (${response.status})`);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        notifications.push({ type: 'error', title: 'Save failed', description: (error as Error).message });
      }
    });
  });
</script>

<svelte:head>
  <title>{data.chapterName} - Comic Translator</title>
</svelte:head>

<CanvasEditor
  projectId={data.projectId}
  chapterId={data.chapterId}
  chapterName={data.chapterName}
/>
