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
                    }
                ]
            }
            companies: {
                Row: {
                    cnpj: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    razao_social: string | null
                }
                Insert: {
                    cnpj: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    razao_social?: string | null
                }
                Update: {
                    cnpj?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    razao_social?: string | null
                }
                Relationships: []
            }
            customers: {
                Row: {
                    cnpj_cpf: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    phone: string | null
                    trade_name: string | null
                }
                Insert: {
                    cnpj_cpf: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    phone?: string | null
                    trade_name?: string | null
                }
                Update: {
                    cnpj_cpf?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    phone?: string | null
                    trade_name?: string | null
                }
                Relationships: []
            }
            investments: {
                Row: {
                    amount: number
                    bank_id: string | null
                    company_id: string | null
                    created_at: string | null
                    current_value: number
                    description: string | null
                    id: string
                    is_active: boolean | null
                    person_id: string | null
                    type: string | null
                }
                Insert: {
                    amount?: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value?: number
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    person_id?: string | null
                    type?: string | null
                }
                Update: {
                    amount?: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value?: number
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    person_id?: string | null
                    type?: string | null
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
                    {
                        foreignKeyName: "investments_person_id_fkey"
                        columns: ["person_id"]
                        isOneToOne: false
                        referencedRelation: "people"
                        referencedColumns: ["id"]
                    }
                ]
            }
            payables: {
                Row: {
                    amount: number
                    bank_id: string
                    company_id: string
                    created_at: string | null
                    description: string
                    due_date: string
                    id: string
                    status: string
                    supplier_id: string
                }
                Insert: {
                    amount: number
                    bank_id: string
                    company_id: string
                    created_at?: string | null
                    description: string
                    due_date: string
                    id?: string
                    status?: string
                    supplier_id: string
                }
                Update: {
                    amount?: number
                    bank_id?: string
                    company_id?: string
                    created_at?: string | null
                    description?: string
                    due_date?: string
                    id?: string
                    status?: string
                    supplier_id?: string
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
                    }
                ]
            }
            people: {
                Row: {
                    cpf: string | null
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    nickname: string | null
                }
                Insert: {
                    cpf?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    nickname?: string | null
                }
                Update: {
                    cpf?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    nickname?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    celular: string | null
                    created_at: string | null
                    funcao: string | null
                    id: string
                    is_blocked: boolean | null
                    is_first_access: boolean | null
                    nome: string
                    role: string | null
                }
                Insert: {
                    celular?: string | null
                    created_at?: string | null
                    funcao?: string | null
                    id: string
                    is_blocked?: boolean | null
                    is_first_access?: boolean | null
                    nome: string
                    role?: string | null
                }
                Update: {
                    celular?: string | null
                    created_at?: string | null
                    funcao?: string | null
                    id?: string
                    is_blocked?: boolean | null
                    is_first_access?: boolean | null
                    nome?: string
                    role?: string | null
                }
                Relationships: []
            }
            receivables: {
                Row: {
                    amount: number
                    bank_id: string
                    company_id: string
                    created_at: string | null
                    customer_id: string
                    description: string
                    due_date: string
                    id: string
                    status: string
                }
                Insert: {
                    amount: number
                    bank_id: string
                    company_id: string
                    created_at?: string | null
                    customer_id: string
                    description: string
                    due_date: string
                    id?: string
                    status?: string
                }
                Update: {
                    amount?: number
                    bank_id?: string
                    company_id?: string
                    created_at?: string | null
                    customer_id?: string
                    description?: string
                    due_date?: string
                    id?: string
                    status?: string
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
                    }
                ]
            }
            suppliers: {
                Row: {
                    cnpj_cpf: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    phone: string | null
                    trade_name: string | null
                }
                Insert: {
                    cnpj_cpf: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    phone?: string | null
                    trade_name?: string | null
                }
                Update: {
                    cnpj_cpf?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    phone?: string | null
                    trade_name?: string | null
                }
                Relationships: []
            }
        }
    }
}
