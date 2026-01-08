export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string | null
                    id: string
                    new_data: Json | null
                    old_data: Json | null
                    table_name: string | null
                    timestamp: string | null
                    user_email: string | null
                }
                Insert: {
                    action?: string | null
                    id?: string
                    new_data?: Json | null
                    old_data?: Json | null
                    table_name?: string | null
                    timestamp?: string | null
                    user_email?: string | null
                }
                Update: {
                    action?: string | null
                    id?: string
                    new_data?: Json | null
                    old_data?: Json | null
                    table_name?: string | null
                    timestamp?: string | null
                    user_email?: string | null
                }
                Relationships: []
            }
            banks: {
                Row: {
                    account_number: string | null
                    account_type: string | null
                    agency: string | null
                    company_id: string | null
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    owner_document: string | null
                    owner_name: string | null
                    type: string | null
                }
                Insert: {
                    account_number?: string | null
                    account_type?: string | null
                    agency?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    owner_document?: string | null
                    owner_name?: string | null
                    type?: string | null
                }
                Update: {
                    account_number?: string | null
                    account_type?: string | null
                    agency?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    owner_document?: string | null
                    owner_name?: string | null
                    type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "banks_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            companies: {
                Row: {
                    cnpj: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    name: string
                    razao_social: string | null
                }
                Insert: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    razao_social?: string | null
                }
                Update: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    razao_social?: string | null
                }
                Relationships: []
            }
            company_partners: {
                Row: {
                    company_id: string | null
                    cpf: string | null
                    created_at: string | null
                    id: string
                    name: string | null
                    participation_percentage: number | null
                }
                Insert: {
                    company_id?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string | null
                    participation_percentage?: number | null
                }
                Update: {
                    company_id?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    id?: string
                    name?: string | null
                    participation_percentage?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "company_partners_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            customers: {
                Row: {
                    cnpj: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    razao_social: string | null
                    trade_name: string | null
                }
                Insert: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    razao_social?: string | null
                    trade_name?: string | null
                }
                Update: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    razao_social?: string | null
                    trade_name?: string | null
                }
                Relationships: []
            }
            investments: {
                Row: {
                    amount: number | null
                    bank_id: string | null
                    company_id: string | null
                    created_at: string | null
                    current_value: number | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                }
                Insert: {
                    amount?: number | null
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value?: number | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                }
                Update: {
                    amount?: number | null
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value?: number | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "investments_bank_id_fkey"
                        columns: ["bank_id"]
                        isOneToOne: false
                        referencedRelation: "banks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "investments_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            payables: {
                Row: {
                    amount: number
                    bank_id: string | null
                    company_id: string | null
                    created_at: string | null
                    description: string
                    due_date: string
                    id: string
                    payment_date: string | null
                    status: string | null
                    supplier_id: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    description: string
                    due_date: string
                    id?: string
                    payment_date?: string | null
                    status?: string | null
                    supplier_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    description?: string
                    due_date?: string
                    id?: string
                    payment_date?: string | null
                    status?: string | null
                    supplier_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payables_bank_id_fkey"
                        columns: ["bank_id"]
                        isOneToOne: false
                        referencedRelation: "banks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payables_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payables_supplier_id_fkey"
                        columns: ["supplier_id"]
                        isOneToOne: false
                        referencedRelation: "suppliers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payables_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            people: {
                Row: {
                    cpf: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    nickname: string | null
                }
                Insert: {
                    cpf?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    nickname?: string | null
                }
                Update: {
                    cpf?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    nickname?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string
                    failed_attempts: number | null
                    id: string
                    is_blocked: boolean | null
                    is_first_access: boolean | null
                    nome: string | null
                    role: string | null
                    status: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email: string
                    failed_attempts?: number | null
                    id: string
                    is_blocked?: boolean | null
                    is_first_access?: boolean | null
                    nome?: string | null
                    role?: string | null
                    status?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string
                    failed_attempts?: number | null
                    id?: string
                    is_blocked?: boolean | null
                    is_first_access?: boolean | null
                    nome?: string | null
                    role?: string | null
                    status?: string | null
                }
                Relationships: []
            }
            receivables: {
                Row: {
                    amount: number
                    bank_id: string | null
                    company_id: string | null
                    created_at: string | null
                    customer_id: string | null
                    description: string
                    due_date: string
                    id: string
                    received_date: string | null
                    status: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    customer_id?: string | null
                    description: string
                    due_date: string
                    id?: string
                    received_date?: string | null
                    status?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    customer_id?: string | null
                    description?: string
                    due_date?: string
                    id?: string
                    received_date?: string | null
                    status?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "receivables_bank_id_fkey"
                        columns: ["bank_id"]
                        isOneToOne: false
                        referencedRelation: "banks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "receivables_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "receivables_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "receivables_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            suppliers: {
                Row: {
                    cnpj: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    razao_social: string | null
                    trade_name: string | null
                }
                Insert: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    razao_social?: string | null
                    trade_name?: string | null
                }
                Update: {
                    cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    razao_social?: string | null
                    trade_name?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
