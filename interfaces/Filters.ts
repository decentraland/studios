export interface FilterGroup {
    title: string
    options: Filter[]
}

export interface Filter {
    value: any
    displayValue?: string
    key: string
    style?: object
}