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
                    city: string | null
                    cnpj: string | null
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    state: string | null
                }
                Insert: {
                    city?: string | null
                    cnpj?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    state?: string | null
                }
                Update: {
                    city?: string | null
                    cnpj?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    state?: string | null
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
                    amount: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value: number
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
            people: {
                Row: {
                    city: string | null
                    cpf: string | null
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    nickname: string | null
                    phone: string | null
                    state: string | null
                }
                Insert: {
                    city?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    nickname?: string | null
                    phone?: string | null
                    state?: string | null
                }
                Update: {
                    city?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    nickname?: string | null
                    phone?: string | null
                    state?: string | null
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
