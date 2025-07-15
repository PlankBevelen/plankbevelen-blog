export interface AlbumItem {
    id: number;
    title: string;
    image: string;
    description: string;
    updateDate: string;
}

export interface AlbumListItem {
    id: number;
    parent: number;
    image: string;
    updateDate: string;
}