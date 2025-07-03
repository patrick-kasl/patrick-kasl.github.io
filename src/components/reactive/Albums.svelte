<script lang="ts">
    import { type CollectionEntry } from "astro:content";
    import { filters } from "../../stores/filters.store";
    import Filters from "./Filters.svelte";
    import { cn } from "../../styles/cn";
    import { Image } from "astro:assets";

    interface Props {
        allAlbums: CollectionEntry<"albums">[];
    }
    const { allAlbums }: Props = $props();
    // let sortedAlbums: CollectionEntry<"albums">[] = $state(allAlbums);

    // function getIntersectionLength(a: any[], b: any[]): number {
    //     const intersection = a.filter((value) => b.includes(value));
    //     return intersection.length;
    // }

    // function sortPosts(filters: string[]) {
    //     if (!filters || filters.length == 0) {

    //         sortedAlbums = allAlbums.sort(

    //             (a: any, b: any) =>
    //                 b.data.date.valueOf() - a.data.date.valueOf(),
    //         );
    //         return;
    //     }

    //     sortedAlbums = allAlbums.sort(
    //         (a: any, b: any) =>
    //             getIntersectionLength(b.data.tags, filters) -
    //             getIntersectionLength(a.data.tags, filters),
    //     );
    // }

    // filters.subscribe((value) => {
    //     sortPosts([...value]);
    // });

    function compareTags(a: string, b: string): number {
        const includesA: boolean = $filters.includes(a);
        const includesB: boolean = $filters.includes(b);
        return includesA && includesB ? 0 : includesA ? -1 : 1;
    }

    function getSortedTags(album: CollectionEntry<"albums">): string[] {
        const sortedTags: string[] = [...album.data.tags];
        sortedTags.sort((a, b) => compareTags(a, b));
        return sortedTags;
    }
</script>

{#snippet albumCard(album: CollectionEntry<"albums">)}
    <a
        href={`/albums/${album.id}`}
        class="flex flex-col justify-between gap-2 min-h-32 p-2 border rounded-interactive border-edge bg-linear-to-b from-secondary to-secondary/60 pointer-events-auto hover:border-accent duration-200 mb-4"
        style="break-inside: avoid;"
    >
        <div>
            <div>
                <img src={album.data.cover.src} alt={album.data.title} />
                <h2 class="text-lg font-semibold">{album.data.title}</h2>
                <p>{album.data.description}</p>
            </div>
            <div class="flex flex-row gap-2 overflow-hidden text-accent">
                {#each getSortedTags(album) as tag}
                    <span
                        class={$filters.length > 0 && !$filters.includes(tag)
                            ? "opacity-60"
                            : "font-black"}>{tag}</span
                    >
                {/each}
            </div>
        </div>
    </a>
{/snippet}

<Filters />

<div class="mx-auto container columns-1 md:columns-2 lg:columns-3 xl:columns-3 gap-4 p-4 rounded-interactive pointer-events-none hover:border-edge duration-200">
    {#each allAlbums as album}
        {@render albumCard(album)}
    {/each}
</div>
