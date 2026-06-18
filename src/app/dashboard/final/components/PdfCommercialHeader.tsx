'use client';

import React from 'react';
import { Text, View, StyleSheet, Svg, Path, Image } from '@react-pdf/renderer';
import { PDF_FONT_REGULAR, PDF_FONT_BOLD } from '@/lib/pdfFonts';

const PDF_WHITE_LOGO_PATH = '/icons/white-logo.png';

export interface PdfHeaderMeta {
  client: string;
  taskNumber: string;
  date: string;
  bidNumber?: string;
  objectDescription?: string;
  outgoingNumber?: string;
  outgoingDate?: string;
}

export interface PdfCommercialHeaderProps {
  meta: PdfHeaderMeta;
  user?: {
    lastName?: string;
    firstName?: string;
    username?: string;
    phone?: string;
    email?: string;
  } | null;
  /** Абсолютный URL white-logo.png для @react-pdf/renderer */
  logoSrc?: string;
}

/** Белый логотип из public/icons/white-logo.png */
export function getPdfWhiteLogoSrc(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${PDF_WHITE_LOGO_PATH}`;
  }
  return PDF_WHITE_LOGO_PATH;
}

const BRAND_GREEN = '#90bd20';
const BAR_HEIGHT = 58;
/** Полный логотип из PNG: АЭТЗ + «астанинский электротехнический завод» (без дубля в React) */
const LOGO_HEIGHT = 36;
const LOGO_WIDTH = 278;
/** Срез правого нижнего угла зелёной полосы */
const CHAMFER_W = 26;
const CHAMFER_H = 14;

const headerStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  brandBarOuter: {
    position: 'relative',
    height: BAR_HEIGHT,
    marginBottom: 0,
  },
  brandBarSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
  },
  brandBarContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 18,
  },
  brandLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
    flexShrink: 1,
  },
  brandTagline: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: PDF_FONT_BOLD,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  brandSite: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: PDF_FONT_REGULAR,
  },
  brandRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'flex-end',
  },
  brandLogoImage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    objectFit: 'contain',
  },
  body: {
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  rightCol: {
    maxWidth: '48%',
    alignItems: 'flex-end',
  },
  line: {
    fontSize: 9,
    color: '#1a1a1a',
    fontFamily: PDF_FONT_REGULAR,
    marginBottom: 3,
    lineHeight: 1.35,
  },
  lineBold: {
    fontSize: 9,
    color: '#1a1a1a',
    fontFamily: PDF_FONT_BOLD,
    marginBottom: 3,
    lineHeight: 1.35,
  },
  calcLine: {
    fontSize: 10,
    color: '#1a1a1a',
    fontFamily: PDF_FONT_BOLD,
    marginTop: 8,
    marginBottom: 2,
  },
  outgoingLine: {
    fontSize: 9,
    color: '#1a1a1a',
    fontFamily: PDF_FONT_REGULAR,
    marginBottom: 4,
  },
  executorLine: {
    fontSize: 8,
    color: '#1a1a1a',
    fontFamily: PDF_FONT_REGULAR,
    textAlign: 'right',
    lineHeight: 1.35,
  },
});

/** Зелёная полоса со срезом справа снизу (без border-trick — он даёт чёрный артефакт) */
function BrandBarBackground() {
  const h = BAR_HEIGHT;
  const cutX = 1000 - CHAMFER_W;
  const cutY = h - CHAMFER_H;
  const d = `M 0 0 H 1000 V ${cutY} L ${cutX} ${h} H 0 Z`;

  return (
    <Svg style={headerStyles.brandBarSvg} viewBox={`0 0 1000 ${h}`} preserveAspectRatio="none">
      <Path d={d} fill={BRAND_GREEN} />
    </Svg>
  );
}

function formatPdfDate(dateStr: string): string {
  if (!dateStr) return '';
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  }
  return dateStr;
}

function formatClientCompany(client: string): string {
  const trimmed = (client || '').trim();
  if (!trimmed) return '—';
  if (/^тоо\s/i.test(trimmed) || /^"тоо/i.test(trimmed)) {
    return trimmed;
  }
  return `ТОО "${trimmed}"`;
}

function formatExecutorShortName(user: PdfCommercialHeaderProps['user']): string {
  if (!user) return '';
  const last = (user.lastName || '').trim();
  const first = (user.firstName || '').trim();
  if (last && first) {
    const initial = first.charAt(0).toUpperCase();
    return `${last} ${initial}.`;
  }
  return last || first || user.username || '';
}

function buildExecutorLine(user: PdfCommercialHeaderProps['user']): string {
  const name = formatExecutorShortName(user);
  const parts: string[] = [];
  if (name) parts.push(`Исполнитель ${name}`);
  if (user?.phone) parts.push(user.phone);
  if (user?.email) parts.push(user.email);
  return parts.join(' | ');
}

export function PdfCommercialHeader({ meta, user, logoSrc }: PdfCommercialHeaderProps) {
  const resolvedLogoSrc = logoSrc || getPdfWhiteLogoSrc();
  const clientLine = formatClientCompany(meta.client);
  const objectRaw = (meta.objectDescription || '').trim();
  const clientRaw = (meta.client || '').trim();
  const objectText =
    objectRaw && objectRaw.toLowerCase() !== clientRaw.toLowerCase()
      ? objectRaw
      : clientRaw
        ? clientRaw
        : '';
  const calculationNo = (meta.taskNumber || meta.bidNumber || '').trim();
  const outgoingNo = (meta.outgoingNumber || meta.taskNumber || meta.bidNumber || '').trim();
  const outgoingDate = formatPdfDate(meta.outgoingDate || meta.date);
  const executorLine = buildExecutorLine(user);

  return (
    <View style={headerStyles.wrapper}>
      <View style={headerStyles.brandBarOuter}>
        <BrandBarBackground />
        <View style={headerStyles.brandBarContent}>
          <View style={headerStyles.brandLeft}>
            <Text style={headerStyles.brandTagline}>УПРАВЛЯЯ ЭНЕРГИЕЙ</Text>
            <Text style={headerStyles.brandSite}>www.aetz.kz</Text>
          </View>
          <View style={headerStyles.brandRight}>
            <Image src={resolvedLogoSrc} style={headerStyles.brandLogoImage} />
          </View>
        </View>
      </View>

      <View style={headerStyles.body}>
        <View style={headerStyles.row}>
          <View style={headerStyles.leftCol}>
            <Text style={headerStyles.line}>Первому руководителю</Text>
            <Text style={headerStyles.lineBold}>{clientLine}</Text>
            {objectText ? (
              <Text style={headerStyles.line}>Объект: {objectText}</Text>
            ) : null}
          </View>
          <View style={headerStyles.rightCol}>
            {executorLine ? (
              <Text style={headerStyles.executorLine}>{executorLine}</Text>
            ) : null}
          </View>
        </View>

        {calculationNo ? (
          <Text style={headerStyles.calcLine}>РАСЧЕТ №{calculationNo}</Text>
        ) : null}
        {outgoingNo && outgoingDate ? (
          <Text style={headerStyles.outgoingLine}>
            Исх.№{outgoingNo} от {outgoingDate}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
