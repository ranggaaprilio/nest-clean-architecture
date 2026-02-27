import {
  ResourceObject,
  ResourceIdentifier,
  JSONAPIResponse,
  JSONAPIError,
  JSONAPIErrorSource,
} from './jsonapi.interfaces'

import { Injectable } from '@nestjs/common'

@Injectable()
export class JSONAPIFormatter {
  private readonly JSONAPI_VERSION = '1.1'

  /**
   * Memformat satu objek sumber daya ke dalam format JSON:API Resource Object.
   * @param type Tipe sumber daya (misal: 'users', 'products').
   * @param id ID unik sumber daya. Dapat berupa string atau number.
   * @param attributes Objek yang berisi atribut sumber daya.
   * @param relationships (Opsional) Objek yang berisi data hubungan antar sumber daya.
   * @param links (Opsional) Objek yang berisi tautan khusus untuk sumber daya ini.
   * @param meta (Opsional) Objek yang berisi metadata tentang sumber daya.
   * @returns ResourceObject yang diformat.
   */
  public formatResource(
    type: string,
    id: string | number,
    attributes: {
      [key: string]: any
    },
    relationships?: {
      [key: string]: {
        data: ResourceIdentifier | ResourceIdentifier[] | null
        links?: {
          self?: string
          related?: string
          [key: string]: any
        }
        meta?: {
          [key: string]: any
        }
      }
    },
    links?: {
      self?: string
      [key: string]: any
    },
    meta?: {
      [key: string]: any
    }
  ): ResourceObject {
    const resource: ResourceObject = {
      type: type,
      id: id.toString(),
      attributes: attributes,
    }

    if (relationships) {
      resource.relationships = relationships
    }
    if (links) {
      resource.links = links
    }
    if (meta) {
      resource.meta = meta
    }

    return resource
  }

  /**
   * Memformat satu atau lebih objek sumber daya ke dalam struktur respons JSON:API lengkap.
   * Ini adalah metode utama untuk membangun payload respons data yang sukses.
   * @param data Single ResourceObject atau array dari ResourceObject, atau null jika data tidak ada.
   * @param included (Opsional) Array dari ResourceObject terkait yang akan disertakan (sideloading).
   * @param meta (Opsional) Metadata tingkat atas untuk respons.
   * @param links (Opsional) Objek tautan (misal: self, first, next, last, describedby).
   * @returns Objek JSONAPIResponse yang diformat.
   */
  public formatDataResponse(
    data: ResourceObject | ResourceObject[] | null,
    included?: ResourceObject[],
    meta?: {
      [key: string]: any
    },
    links?: {
      self?: string
      related?: string
      first?: string
      last?: string
      prev?: string
      next?: string
      describedby?: string
      [key: string]: any
    }
  ): JSONAPIResponse {
    const response: JSONAPIResponse = {
      data: data,
      jsonapi: {
        version: this.JSONAPI_VERSION,
      },
    }

    if (included && included.length > 0) {
      response.included = included
    }
    if (meta) {
      response.meta = meta
    }
    if (links) {
      response.links = links
    }

    return response
  }

  /**
   * Memformat respons kesalahan sesuai pedoman JSON:API.
   * Anda dapat menyediakan satu atau lebih objek kesalahan.
   * @param errors Array dari objek JSONAPIError.
   * @param meta (Opsional) Metadata tingkat atas untuk respons kesalahan.
   * @param links (Opsional) Objek tautan untuk respons kesalahan.
   * @returns Objek JSONAPIResponse yang diformat untuk kesalahan.
   */
  public formatErrorResponse(
    errors: JSONAPIError[],
    meta?: {
      [key: string]: any
    },
    links?: {
      self?: string
      [key: string]: any
    }
  ): JSONAPIResponse {
    const response: JSONAPIResponse = {
      errors: errors,
      jsonapi: {
        version: this.JSONAPI_VERSION,
      },
    }

    if (meta) {
      response.meta = meta
    }
    if (links) {
      response.links = links
    }

    return response
  }

  /**
   * Helper method untuk membuat objek kesalahan tunggal JSON:API.
   * @param status Kode status HTTP sebagai string (misal: "404").
   * @param title Ringkasan singkat tentang kesalahan.
   * @param detail Detail lebih lanjut tentang kesalahan spesifik.
   * @param source (Opsional) Objek yang menunjukkan asal kesalahan (pointer, parameter, header).
   * @param code (Opsional) Kode kesalahan unik untuk aplikasi Anda.
   * @param id (Opsional) ID unik untuk kesalahan spesifik ini.
   * @param links (Opsional) Tautan yang relevan dengan kesalahan ini (misal: tautan 'about' ke dokumentasi kesalahan).
   * @param meta (Opsional) Metadata spesifik untuk kesalahan ini.
   * @returns Objek JSONAPIError tunggal.
   */
  public createError(
    status?: string | number,
    title?: string,
    detail?: string,
    source?: JSONAPIErrorSource,
    code?: string | number,
    id?: string,
    links?: {
      about?: string
      [key: string]: any
    },
    meta?: {
      [key: string]: any
    }
  ): JSONAPIError {
    const error: JSONAPIError = {}

    if (id) error.id = id
    if (links) error.links = links
    if (status) error.status = status.toString()
    if (code) error.code = code.toString()
    if (title) error.title = title
    if (detail) error.detail = detail
    if (source) error.source = source
    if (meta) error.meta = meta

    return error
  }

  /**
   * Helper method untuk memformat respons daftar sumber daya.
   * Metode ini akan mengekstrak `id` dari setiap item dan menggunakan properti lainnya sebagai `attributes`.
   * @param type Tipe sumber daya.
   * @param items Array objek JavaScript yang akan diformat. Setiap objek harus memiliki properti `id`.
   * @param meta (Opsional) Metadata tingkat atas untuk respons.
   * @param links (Opsional) Objek tautan (misal: self, first, next, last).
   * @returns Objek JSONAPIResponse yang diformat.
   */
  public formatListResponse<
    T extends { id: string | number; [key: string]: any },
  >(
    type: string,
    items: T[],
    meta?: {
      [key: string]: any
    },
    links?: {
      self?: string
      related?: string
      first?: string
      last?: string
      prev?: string
      next?: string
      describedby?: string
      [key: string]: any
    }
  ): JSONAPIResponse {
    const data = items.map(item =>
      this.formatResource(type, item.id, this.extractAttributes(item))
    )
    return this.formatDataResponse(data, undefined, meta, links)
  }

  /**
   * Mengekstrak atribut dari objek JavaScript.
   * Secara default, ini akan mengambil semua properti kecuali 'id' dan properti yang diawali '@'.
   * Anda mungkin perlu menyesuaikan ini berdasarkan bagaimana model Anda menyimpan data atau jika ada properti yang harus diabaikan.
   * @param item Objek sumber daya.
   * @returns Objek yang berisi atribut.
   */
  private extractAttributes<
    T extends { id: string | number; [key: string]: any },
  >(
    item: T
  ): {
    [key: string]: any
  } {
    const attributes: {
      [key: string]: any
    } = {}
    for (const key in item) {
      if (
        Object.prototype.hasOwnProperty.call(item, key) &&
        key !== 'id' &&
        !key.startsWith('@')
      ) {
        attributes[key] = item[key]
      }
    }
    return attributes
  }
}
