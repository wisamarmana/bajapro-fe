export type User = {
    id : number;
    code: string;
    name: string;
    email: string;
    nip: number;
    role: string;
    school_instance: string;
    password: string;
    avatar_url: string;
    approval: number;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
}

export type CreateUserDto = {
    name: string;
    email: string;
    password: string;
    role: string;
    nip?: number;
    school_instance?: string;
}

export type UpdateUserDto = {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    nip?: number;
    school_instance?: string;
}