const DB_URL = process.env.NEXT_PUBLIC_PARTNERS_DATA_URL
const API_TOKEN = process.env.API_ACCESS_TOKEN

export default class Files {

    static async upload(blob: Blob, fileName: string, folder: string) {

        const formData = new FormData()

        formData.append('folder', folder)

        formData.append('file', blob, fileName)

        return fetch(`${DB_URL}/files`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
            },
            body: formData,
        })

    }

}
